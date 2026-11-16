import {
  Account,
  Budget,
  Category,
  FinoraState,
  PeriodRange,
  SavingsGoal,
  Transaction,
  TransactionType,
} from '../types/finance';
import { formatIDR, toMonthKey } from './formatters';

export interface AccountWithBalance extends Account {
  currentBalance: number;
  transactionCount: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface DailyCashflowPoint {
  date: string; // YYYY-MM-DD
  label: string;
  income: number;
  expense: number;
  transfer: number;
  txCount: number;
}

export interface BudgetProgressItem {
  budget: Budget;
  categoryName: string;
  categoryColor: string;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'aman' | 'peringatan' | 'melebihi';
}

export interface SavingsGoalSummary {
  goal: SavingsGoal;
  savedAmount: number;
  remainingAmount: number;
  percentage: number;
  recommendedMonthly: number | null;
  estimatedCompletionDate: string | null;
}

export function computeAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = Math.round(account.openingBalance);
  for (const tx of transactions) {
    const amt = Math.round(tx.amount);
    if (tx.type === 'income' && tx.accountId === account.id) {
      balance += amt;
    } else if (tx.type === 'expense' && tx.accountId === account.id) {
      balance -= amt;
    } else if (tx.type === 'transfer') {
      if (tx.accountId === account.id) {
        balance -= amt;
      }
      if (tx.destinationAccountId === account.id) {
        balance += amt;
      }
    } else if (tx.type === 'adjustment' && tx.accountId === account.id) {
      if (tx.adjustmentDirection === 'decrease') {
        balance -= amt;
      } else {
        balance += amt;
      }
    }
  }
  return balance;
}

export function computeAccountsWithBalances(
  accounts: Account[],
  transactions: Transaction[],
): AccountWithBalance[] {
  return accounts.map((account) => {
    const txCount = transactions.filter(
      (tx) => tx.accountId === account.id || tx.destinationAccountId === account.id,
    ).length;
    return {
      ...account,
      currentBalance: computeAccountBalance(account, transactions),
      transactionCount: txCount,
    };
  });
}

export function computeTotalBalance(accountsWithBalances: AccountWithBalance[]): number {
  return accountsWithBalances
    .filter((acc) => !acc.isArchived && acc.includeInTotal)
    .reduce((sum, acc) => sum + acc.currentBalance, 0);
}

export interface TransactionFilterOptions {
  search?: string;
  type?: TransactionType | 'all';
  accountId?: string;
  categoryId?: string;
  source?: 'all' | 'manual' | 'import' | 'system';
  startDate?: string;
  endDate?: string;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export function filterTransactions(
  transactions: Transaction[],
  categories: Category[],
  options: TransactionFilterOptions,
): Transaction[] {
  const catMap = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));
  const query = options.search?.trim().toLowerCase() || '';

  const filtered = transactions.filter((tx) => {
    const txDate = tx.date.slice(0, 10);
    if (options.startDate && txDate < options.startDate) return false;
    if (options.endDate && txDate > options.endDate) return false;
    if (options.type && options.type !== 'all' && tx.type !== options.type) return false;
    if (
      options.accountId &&
      options.accountId !== 'all' &&
      tx.accountId !== options.accountId &&
      tx.destinationAccountId !== options.accountId
    ) {
      return false;
    }
    if (options.categoryId && options.categoryId !== 'all') {
      if (options.categoryId === 'uncategorized') {
        if (tx.categoryId) return false;
      } else if (tx.categoryId !== options.categoryId) {
        return false;
      }
    }
    if (options.source && options.source !== 'all' && tx.source !== options.source) {
      return false;
    }

    if (query) {
      const catName = tx.categoryId ? catMap.get(tx.categoryId) || '' : '';
      const haystack = `${tx.id} ${tx.description} ${tx.note || ''} ${catName}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sortBy = options.sortBy || 'date_desc';
  return [...filtered].sort((a, b) => {
    if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
  });
}

export function computePeriodMetrics(
  transactions: Transaction[],
  categories: Category[],
  periodRange: PeriodRange,
  accountIdFilter = 'all',
) {
  const inPeriod = filterTransactions(transactions, categories, {
    startDate: periodRange.startDate,
    endDate: periodRange.endDate,
    accountId: accountIdFilter,
  });

  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransfer = 0;

  const expenseByCategory = new Map<string, { amount: number; count: number }>();
  const dailyMap = new Map<string, DailyCashflowPoint>();

  for (const tx of inPeriod) {
    const dayKey = tx.date.slice(0, 10);
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, {
        date: dayKey,
        label: dayKey.slice(8, 10) + '/' + dayKey.slice(5, 7),
        income: 0,
        expense: 0,
        transfer: 0,
        txCount: 0,
      });
    }
    const dayPoint = dailyMap.get(dayKey)!;
    dayPoint.txCount += 1;

    if (tx.type === 'income') {
      totalIncome += tx.amount;
      dayPoint.income += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
      dayPoint.expense += tx.amount;
      const catId = tx.categoryId || 'uncategorized';
      const prev = expenseByCategory.get(catId) || { amount: 0, count: 0 };
      expenseByCategory.set(catId, {
        amount: prev.amount + tx.amount,
        count: prev.count + 1,
      });
    } else if (tx.type === 'transfer') {
      totalTransfer += tx.amount;
      dayPoint.transfer += tx.amount;
    }
  }

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const categoryBreakdown: CategoryBreakdownItem[] = Array.from(expenseByCategory.entries())
    .map(([categoryId, data]) => {
      const cat = catMap.get(categoryId);
      return {
        categoryId,
        name: cat?.name || 'Belum dikategorikan',
        color: cat?.color || '#8B8EA3',
        amount: data.amount,
        percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 1000) / 10 : 0,
        count: data.count,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const dailyPoints = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Previous period comparison (same day span immediately preceding startDate)
  const startMs = new Date(`${periodRange.startDate}T00:00:00`).getTime();
  const endMs = new Date(`${periodRange.endDate}T00:00:00`).getTime();
  const spanDays = Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);
  const prevEnd = new Date(startMs - 86400000);
  const prevStart = new Date(prevEnd.getTime() - (spanDays - 1) * 86400000);
  const prevStartStr = prevStart.toISOString().slice(0, 10);
  const prevEndStr = prevEnd.toISOString().slice(0, 10);

  const prevTx = filterTransactions(transactions, categories, {
    startDate: prevStartStr,
    endDate: prevEndStr,
    accountId: accountIdFilter,
  });

  const prevIncome = prevTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const hasPreviousComparison = prevTx.length > 0 && (prevIncome > 0 || prevExpense > 0);

  return {
    transactions: inPeriod,
    totalIncome,
    totalExpense,
    netCashflow: totalIncome - totalExpense,
    totalTransfer,
    averageDailyExpense: Math.round(totalExpense / spanDays),
    categoryBreakdown,
    dailyPoints,
    hasPreviousComparison,
    previousIncome: prevIncome,
    previousExpense: prevExpense,
    expenseChangePct:
      hasPreviousComparison && prevExpense > 0
        ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100)
        : null,
    incomeChangePct:
      hasPreviousComparison && prevIncome > 0
        ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100)
        : null,
  };
}

export function computeBudgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  monthKey: string,
): BudgetProgressItem[] {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const monthBudgets = budgets.filter((b) => b.monthKey === monthKey);

  return monthBudgets
    .map((budget) => {
      const cat = catMap.get(budget.categoryId);
      const spent = transactions
        .filter(
          (tx) =>
            tx.type === 'expense' &&
            tx.categoryId === budget.categoryId &&
            toMonthKey(tx.date) === monthKey,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);
      const remaining = budget.limitAmount - spent;
      const percentage =
        budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 1000) / 10 : 0;

      let status: 'aman' | 'peringatan' | 'melebihi' = 'aman';
      if (percentage > 100) {
        status = 'melebihi';
      } else if (percentage >= budget.warningThreshold) {
        status = 'peringatan';
      }

      return {
        budget,
        categoryName: cat?.name || 'Kategori Dihapus',
        categoryColor: cat?.color || '#8B8EA3',
        spent,
        remaining,
        percentage,
        status,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
}

export function computeSavingsGoalSummary(goal: SavingsGoal): SavingsGoalSummary {
  const savedAmount = Math.max(
    0,
    goal.contributions.reduce(
      (sum, c) => (c.type === 'deposit' ? sum + c.amount : sum - c.amount),
      0,
    ),
  );
  const remainingAmount = Math.max(0, goal.targetAmount - savedAmount);
  const percentage =
    goal.targetAmount > 0
      ? Math.min(100, Math.round((savedAmount / goal.targetAmount) * 1000) / 10)
      : 0;

  let recommendedMonthly: number | null = null;
  if (remainingAmount > 0 && goal.targetDate) {
    const now = new Date();
    const target = new Date(`${goal.targetDate}T00:00:00`);
    const monthsLeft = Math.max(
      1,
      (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()),
    );
    recommendedMonthly = Math.ceil(remainingAmount / monthsLeft);
  }

  let estimatedCompletionDate: string | null = null;
  if (remainingAmount === 0) {
    estimatedCompletionDate = 'Sudah tercapai';
  } else {
    const deposits = goal.contributions.filter((c) => c.type === 'deposit');
    if (deposits.length > 0) {
      const totalDep = deposits.reduce((s, d) => s + d.amount, 0);
      const firstDate = deposits.map((d) => d.date).sort()[0];
      const daysElapsed = Math.max(
        30,
        Math.round((Date.now() - new Date(`${firstDate}T00:00:00`).getTime()) / 86400000),
      );
      const monthlyPace = totalDep / (daysElapsed / 30);
      if (monthlyPace > 0) {
        const monthsNeeded = Math.ceil(remainingAmount / monthlyPace);
        const estDate = new Date();
        estDate.setMonth(estDate.getMonth() + monthsNeeded);
        estimatedCompletionDate = estDate.toISOString().slice(0, 10);
      }
    }
  }

  return {
    goal,
    savedAmount,
    remainingAmount,
    percentage,
    recommendedMonthly,
    estimatedCompletionDate,
  };
}

export function computeMonthlySeries(
  transactions: Transaction[],
  monthsCount = 6,
  referenceDate = new Date(),
) {
  const result: { monthKey: string; label: string; income: number; expense: number; net: number }[] = [];
  for (let i = monthsCount - 1; i >= 0; i -= 1) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(d);
    const monthTx = transactions.filter((tx) => toMonthKey(tx.date) === mk);
    const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    result.push({ monthKey: mk, label, income, expense, net: income - expense });
  }
  return result;
}

export function buildVerifiedAiSummary(state: FinoraState, periodRange: PeriodRange) {
  const accountsWithBalances = computeAccountsWithBalances(state.accounts, state.transactions);
  const totalBalance = computeTotalBalance(accountsWithBalances);
  const metrics = computePeriodMetrics(state.transactions, state.categories, periodRange, 'all');
  const currentMonthKey = periodRange.endDate.slice(0, 7);
  const budgets = computeBudgetProgress(
    state.budgets,
    state.transactions,
    state.categories,
    currentMonthKey,
  );
  const savings = state.savingsGoals.map(computeSavingsGoalSummary);

  return {
    periode: periodRange.label,
    tanggalMulai: periodRange.startDate,
    tanggalAkhir: periodRange.endDate,
    jumlahTransaksiPeriode: metrics.transactions.length,
    totalSaldoAkunAktif: formatIDR(totalBalance),
    totalSaldoAngka: totalBalance,
    daftarAkun: accountsWithBalances
      .filter((a) => !a.isArchived)
      .map((a) => ({
        nama: a.name,
        jenis: a.type,
        saldo: formatIDR(a.currentBalance),
        saldoNegatif: a.currentBalance < 0,
      })),
    ringkasanPeriode: {
      totalPemasukan: formatIDR(metrics.totalIncome),
      totalPengeluaran: formatIDR(metrics.totalExpense),
      arusKasBersih: formatIDR(metrics.netCashflow),
      totalTransferInternal: formatIDR(metrics.totalTransfer),
      rataRataPengeluaranHarian: formatIDR(metrics.averageDailyExpense),
      perubahanPengeluaranDariPeriodeSebelumnyaPersen: metrics.expenseChangePct,
      perubahanPemasukanDariPeriodeSebelumnyaPersen: metrics.incomeChangePct,
    },
    pengeluaranPerKategori: metrics.categoryBreakdown.slice(0, 8).map((c) => ({
      kategori: c.name,
      nominal: formatIDR(c.amount),
      persentase: `${c.percentage}%`,
      jumlahTransaksi: c.count,
    })),
    anggaranBulanBerjalan: budgets.map((b) => ({
      kategori: b.categoryName,
      batas: formatIDR(b.budget.limitAmount),
      terpakai: formatIDR(b.spent),
      sisa: formatIDR(b.remaining),
      persentaseTerpakai: `${b.percentage}%`,
      status: b.status,
    })),
    targetTabungan: savings.map((s) => ({
      nama: s.goal.name,
      target: formatIDR(s.goal.targetAmount),
      terkumpul: formatIDR(s.savedAmount),
      persentase: `${s.percentage}%`,
      tenggat: s.goal.targetDate || 'Tidak ditentukan',
      estimasiPerBulanYangDisarankan: s.recommendedMonthly
        ? formatIDR(s.recommendedMonthly)
        : null,
    })),
  };
}
