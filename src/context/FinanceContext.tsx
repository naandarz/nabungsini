import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createDemoState, createEmptyState, DEFAULT_CATEGORIES } from '../data/defaultData';
import {
  Account,
  AccountType,
  AiChatMessage,
  Budget,
  Category,
  FinoraState,
  GoalPriority,
  GoalStatus,
  SavingsGoal,
  ToastItem,
  Transaction,
  TransactionSource,
  TransactionType,
  UserPreferences,
} from '../types/finance';
import { clearAllAttachments, deleteAttachmentById } from '../utils/attachmentStorage';
import {
  AccountWithBalance,
  computeAccountsWithBalances,
  computeTotalBalance,
} from '../utils/financeEngine';
import { generateEntityId, generateFinoraTxId, toLocalDateTimeInput } from '../utils/formatters';

const STORAGE_KEY = 'finora_ledger_state_v1';

interface CreateAccountInput {
  name: string;
  type: AccountType;
  institution: string;
  openingBalance: number;
  includeInTotal: boolean;
}

interface SaveTransactionInput {
  id?: string;
  type: TransactionType;
  amount: number;
  date: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  description: string;
  note?: string;
  attachmentIds?: string[];
  source?: TransactionSource;
}

interface CreateGoalInput {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: string;
  priority: GoalPriority;
}

interface FinanceContextValue {
  state: FinoraState;
  accountsWithBalances: AccountWithBalance[];
  activeAccounts: AccountWithBalance[];
  totalBalance: number;
  negativeAccounts: AccountWithBalance[];
  toasts: ToastItem[];
  showToast: (type: ToastItem['type'], message: string) => void;
  dismissToast: (id: string) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  addAccount: (input: CreateAccountInput) => Account;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  toggleArchiveAccount: (id: string) => void;
  reconcileAccount: (accountId: string, actualBalance: number, reason: string) => void;
  saveTransaction: (input: SaveTransactionInput) => Transaction;
  deleteTransaction: (id: string) => Promise<void>;
  importTransactionsBatch: (transactions: Transaction[]) => void;
  addCategory: (name: string, type: 'income' | 'expense', color: string) => void;
  deleteCategory: (id: string) => void;
  upsertBudget: (categoryId: string, monthKey: string, limitAmount: number, warningThreshold: number) => void;
  deleteBudget: (id: string) => void;
  copyBudgetsFromMonth: (fromMonthKey: string, toMonthKey: string) => number;
  createSavingsGoal: (input: CreateGoalInput) => void;
  updateSavingsGoal: (id: string, patch: Partial<Pick<SavingsGoal, 'name' | 'description' | 'targetAmount' | 'targetDate' | 'priority' | 'status'>>) => void;
  deleteSavingsGoal: (id: string) => void;
  recordGoalContribution: (
    goalId: string,
    type: 'deposit' | 'withdraw',
    amount: number,
    date: string,
    note?: string,
    linkedTransferId?: string,
  ) => void;
  appendAiMessages: (messages: AiChatMessage[]) => void;
  clearAiHistory: () => void;
  loadDemoData: () => Promise<void>;
  resetAllData: () => Promise<void>;
  importBackupJson: (jsonText: string) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

function loadInitialState(): FinoraState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw) as Partial<FinoraState>;
    const empty = createEmptyState();
    return {
      version: 1,
      preferences: { ...empty.preferences, ...(parsed.preferences || {}) },
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      categories:
        Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : DEFAULT_CATEGORIES,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : [],
      aiHistory: Array.isArray(parsed.aiHistory) ? parsed.aiHistory : [],
    };
  } catch {
    return createEmptyState();
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinoraState>(loadInitialState);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors silently here; attachment storage uses IndexedDB
    }
  }, [state]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastItem['type'], message: string) => {
      const id = generateEntityId('toast');
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4000);
    },
    [dismissToast],
  );

  const accountsWithBalances = useMemo(
    () => computeAccountsWithBalances(state.accounts, state.transactions),
    [state.accounts, state.transactions],
  );

  const activeAccounts = useMemo(
    () => accountsWithBalances.filter((a) => !a.isArchived),
    [accountsWithBalances],
  );

  const totalBalance = useMemo(
    () => computeTotalBalance(accountsWithBalances),
    [accountsWithBalances],
  );

  const negativeAccounts = useMemo(
    () => activeAccounts.filter((a) => a.currentBalance < 0),
    [activeAccounts],
  );

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...patch },
    }));
  }, []);

  const addAccount = useCallback(
    (input: CreateAccountInput): Account => {
      const now = new Date().toISOString();
      const account: Account = {
        id: generateEntityId('acc'),
        name: input.name.trim(),
        type: input.type,
        institution: input.institution.trim(),
        openingBalance: Math.round(input.openingBalance),
        includeInTotal: input.includeInTotal,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({
        ...prev,
        accounts: [...prev.accounts, account],
      }));
      showToast('success', `Akun "${account.name}" berhasil ditambahkan.`);
      return account;
    },
    [showToast],
  );

  const updateAccount = useCallback(
    (id: string, patch: Partial<Account>) => {
      setState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((acc) =>
          acc.id === id ? { ...acc, ...patch, updatedAt: new Date().toISOString() } : acc,
        ),
      }));
      showToast('success', 'Informasi akun diperbarui.');
    },
    [showToast],
  );

  const toggleArchiveAccount = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((acc) =>
          acc.id === id
            ? { ...acc, isArchived: !acc.isArchived, updatedAt: new Date().toISOString() }
            : acc,
        ),
      }));
      showToast('info', 'Status arsip akun diperbarui.');
    },
    [showToast],
  );

  const reconcileAccount = useCallback(
    (accountId: string, actualBalance: number, reason: string) => {
      setState((prev) => {
        const account = prev.accounts.find((a) => a.id === accountId);
        if (!account) return prev;
        const withBal = computeAccountsWithBalances([account], prev.transactions)[0];
        const diff = Math.round(actualBalance) - withBal.currentBalance;
        if (diff === 0) return prev;

        const now = new Date().toISOString();
        const adjustmentTx: Transaction = {
          id: generateFinoraTxId(),
          type: 'adjustment',
          amount: Math.abs(diff),
          date: toLocalDateTimeInput(new Date()),
          accountId,
          adjustmentDirection: diff > 0 ? 'increase' : 'decrease',
          description: `Rekonsiliasi Saldo: ${account.name}`,
          note: reason.trim() || 'Penyesuaian saldo aktual',
          source: 'system',
          status: 'tercatat',
          attachmentIds: [],
          createdAt: now,
          updatedAt: now,
        };

        return {
          ...prev,
          transactions: [adjustmentTx, ...prev.transactions],
        };
      });
      showToast('success', 'Penyesuaian rekonsiliasi saldo berhasil dicatat.');
    },
    [showToast],
  );

  const saveTransaction = useCallback(
    (input: SaveTransactionInput): Transaction => {
      const now = new Date().toISOString();
      const amount = Math.round(Math.abs(input.amount));
      if (amount <= 0) {
        throw new Error('Nominal transaksi harus lebih dari Rp0.');
      }
      if (input.type === 'transfer' && input.accountId === input.destinationAccountId) {
        throw new Error('Akun sumber dan akun tujuan transfer harus berbeda.');
      }

      let savedTx: Transaction | null = null;
      setState((prev) => {
        const existing = input.id ? prev.transactions.find((t) => t.id === input.id) : undefined;
        const tx: Transaction = {
          id: existing ? existing.id : generateFinoraTxId(),
          type: input.type,
          amount,
          date: input.date,
          accountId: input.accountId,
          destinationAccountId:
            input.type === 'transfer' ? input.destinationAccountId : undefined,
          categoryId:
            input.type === 'income' || input.type === 'expense' ? input.categoryId : undefined,
          description: input.description.trim(),
          note: input.note?.trim() || undefined,
          source: existing ? existing.source : input.source || 'manual',
          status: 'tercatat',
          attachmentIds: input.attachmentIds ?? existing?.attachmentIds ?? [],
          importBatchId: existing?.importBatchId,
          createdAt: existing ? existing.createdAt : now,
          updatedAt: now,
        };
        savedTx = tx;

        if (existing) {
          return {
            ...prev,
            transactions: prev.transactions.map((t) => (t.id === existing.id ? tx : t)),
          };
        }
        return {
          ...prev,
          transactions: [tx, ...prev.transactions],
        };
      });

      showToast(
        'success',
        input.id ? 'Transaksi berhasil diperbarui.' : 'Transaksi berhasil dicatat.',
      );
      return savedTx!;
    },
    [showToast],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const target = state.transactions.find((t) => t.id === id);
      if (target && target.attachmentIds.length > 0) {
        await Promise.all(target.attachmentIds.map((attId) => deleteAttachmentById(attId)));
      }
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }));
      showToast('info', 'Transaksi dihapus dan saldo telah diperbarui.');
    },
    [state.transactions, showToast],
  );

  const importTransactionsBatch = useCallback(
    (transactions: Transaction[]) => {
      if (!transactions.length) return;
      setState((prev) => ({
        ...prev,
        transactions: [...transactions, ...prev.transactions],
      }));
      showToast('success', `${transactions.length} transaksi berhasil diimpor dari CSV.`);
    },
    [showToast],
  );

  const addCategory = useCallback(
    (name: string, type: 'income' | 'expense', color: string) => {
      const cat: Category = {
        id: generateEntityId('cat'),
        name: name.trim(),
        type,
        color,
        isDefault: false,
      };
      setState((prev) => ({
        ...prev,
        categories: [...prev.categories, cat],
      }));
      showToast('success', `Kategori "${cat.name}" ditambahkan.`);
    },
    [showToast],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id || c.isDefault),
        transactions: prev.transactions.map((tx) =>
          tx.categoryId === id ? { ...tx, categoryId: undefined } : tx,
        ),
        budgets: prev.budgets.filter((b) => b.categoryId !== id),
      }));
      showToast('info', 'Kategori kustom dihapus.');
    },
    [showToast],
  );

  const upsertBudget = useCallback(
    (categoryId: string, monthKey: string, limitAmount: number, warningThreshold: number) => {
      const now = new Date().toISOString();
      const cleanLimit = Math.round(limitAmount);
      setState((prev) => {
        const existing = prev.budgets.find(
          (b) => b.categoryId === categoryId && b.monthKey === monthKey,
        );
        if (existing) {
          return {
            ...prev,
            budgets: prev.budgets.map((b) =>
              b.id === existing.id
                ? { ...b, limitAmount: cleanLimit, warningThreshold, updatedAt: now }
                : b,
            ),
          };
        }
        const budget: Budget = {
          id: generateEntityId('bud'),
          categoryId,
          monthKey,
          limitAmount: cleanLimit,
          warningThreshold,
          createdAt: now,
          updatedAt: now,
        };
        return {
          ...prev,
          budgets: [...prev.budgets, budget],
        };
      });
      showToast('success', 'Anggaran berhasil disimpan.');
    },
    [showToast],
  );

  const deleteBudget = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        budgets: prev.budgets.filter((b) => b.id !== id),
      }));
      showToast('info', 'Anggaran dihapus.');
    },
    [showToast],
  );

  const copyBudgetsFromMonth = useCallback(
    (fromMonthKey: string, toMonthKey: string): number => {
      let copied = 0;
      const now = new Date().toISOString();
      setState((prev) => {
        const sourceBudgets = prev.budgets.filter((b) => b.monthKey === fromMonthKey);
        if (sourceBudgets.length === 0) return prev;
        const existingCats = new Set(
          prev.budgets.filter((b) => b.monthKey === toMonthKey).map((b) => b.categoryId),
        );
        const newBudgets: Budget[] = [];
        for (const sb of sourceBudgets) {
          if (!existingCats.has(sb.categoryId)) {
            newBudgets.push({
              id: generateEntityId('bud'),
              categoryId: sb.categoryId,
              monthKey: toMonthKey,
              limitAmount: sb.limitAmount,
              warningThreshold: sb.warningThreshold,
              createdAt: now,
              updatedAt: now,
            });
            copied += 1;
          }
        }
        return {
          ...prev,
          budgets: [...prev.budgets, ...newBudgets],
        };
      });
      if (copied > 0) {
        showToast('success', `${copied} anggaran disalin ke periode ini.`);
      } else {
        showToast('info', 'Tidak ada anggaran baru yang perlu disalin.');
      }
      return copied;
    },
    [showToast],
  );

  const createSavingsGoal = useCallback(
    (input: CreateGoalInput) => {
      const now = new Date().toISOString();
      const goal: SavingsGoal = {
        id: generateEntityId('goal'),
        name: input.name.trim(),
        description: input.description?.trim(),
        targetAmount: Math.round(input.targetAmount),
        targetDate: input.targetDate || undefined,
        priority: input.priority,
        status: 'aktif',
        contributions: [],
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({
        ...prev,
        savingsGoals: [...prev.savingsGoals, goal],
      }));
      showToast('success', `Target "${goal.name}" berhasil dibuat.`);
    },
    [showToast],
  );

  const updateSavingsGoal = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<SavingsGoal, 'name' | 'description' | 'targetAmount' | 'targetDate' | 'priority' | 'status'>
      >,
    ) => {
      setState((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.map((g) =>
          g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g,
        ),
      }));
      showToast('success', 'Target tabungan diperbarui.');
    },
    [showToast],
  );

  const deleteSavingsGoal = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.filter((g) => g.id !== id),
      }));
      showToast('info', 'Target tabungan dihapus.');
    },
    [showToast],
  );

  const recordGoalContribution = useCallback(
    (
      goalId: string,
      type: 'deposit' | 'withdraw',
      amount: number,
      date: string,
      note?: string,
      linkedTransferId?: string,
    ) => {
      const now = new Date().toISOString();
      const cleanAmt = Math.round(Math.abs(amount));
      setState((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.map((goal) => {
          if (goal.id !== goalId) return goal;
          const nextContributions = [
            ...goal.contributions,
            {
              id: generateEntityId('cnt'),
              goalId,
              type,
              amount: cleanAmt,
              date,
              note: note?.trim() || undefined,
              linkedTransferId,
              createdAt: now,
            },
          ];
          const totalSaved = Math.max(
            0,
            nextContributions.reduce(
              (sum, c) => (c.type === 'deposit' ? sum + c.amount : sum - c.amount),
              0,
            ),
          );
          const nextStatus: GoalStatus =
            totalSaved >= goal.targetAmount ? 'tercapai' : goal.status === 'tercapai' ? 'aktif' : goal.status;
          return {
            ...goal,
            status: nextStatus,
            contributions: nextContributions,
            updatedAt: now,
          };
        }),
      }));
      showToast(
        'success',
        type === 'deposit' ? 'Kontribusi target dicatat.' : 'Penarikan target dicatat.',
      );
    },
    [showToast],
  );

  const appendAiMessages = useCallback((messages: AiChatMessage[]) => {
    setState((prev) => ({
      ...prev,
      aiHistory: [...prev.aiHistory, ...messages].slice(-40),
    }));
  }, []);

  const clearAiHistory = useCallback(() => {
    setState((prev) => ({ ...prev, aiHistory: [] }));
    showToast('info', 'Riwayat percakapan asisten AI dibersihkan.');
  }, [showToast]);

  const loadDemoData = useCallback(async () => {
    await clearAllAttachments();
    setState(createDemoState(new Date()));
    showToast('success', 'Data contoh berhasil dimuat. Anda dapat mengedit atau mereset kapan saja.');
  }, [showToast]);

  const resetAllData = useCallback(async () => {
    await clearAllAttachments();
    setState(createEmptyState());
    showToast('info', 'Seluruh data lokal berhasil dikosongkan.');
  }, [showToast]);

  const importBackupJson = useCallback(
    (jsonText: string) => {
      const parsed = JSON.parse(jsonText) as Partial<FinoraState>;
      if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) {
        throw new Error('Format file cadangan Finora tidak valid.');
      }
      const empty = createEmptyState();
      setState({
        version: 1,
        preferences: { ...empty.preferences, ...(parsed.preferences || {}) },
        accounts: parsed.accounts,
        categories:
          Array.isArray(parsed.categories) && parsed.categories.length > 0
            ? parsed.categories
            : DEFAULT_CATEGORIES,
        transactions: parsed.transactions,
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
        savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : [],
        aiHistory: Array.isArray(parsed.aiHistory) ? parsed.aiHistory : [],
      });
      showToast('success', 'Cadangan data JSON berhasil dipulihkan.');
    },
    [showToast],
  );

  const value: FinanceContextValue = {
    state,
    accountsWithBalances,
    activeAccounts,
    totalBalance,
    negativeAccounts,
    toasts,
    showToast,
    dismissToast,
    updatePreferences,
    addAccount,
    updateAccount,
    toggleArchiveAccount,
    reconcileAccount,
    saveTransaction,
    deleteTransaction,
    importTransactionsBatch,
    addCategory,
    deleteCategory,
    upsertBudget,
    deleteBudget,
    copyBudgetsFromMonth,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    recordGoalContribution,
    appendAiMessages,
    clearAiHistory,
    loadDemoData,
    resetAllData,
    importBackupJson,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider');
  return ctx;
}
