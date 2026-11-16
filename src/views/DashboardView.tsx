import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Paperclip,
  Plus,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PeriodPreset, Transaction, TransactionType } from '../types/finance';
import type { NavTabId } from '../types/navigation';
import {
  computeBudgetProgress,
  computePeriodMetrics,
  computeSavingsGoalSummary,
} from '../utils/financeEngine';
import { formatDateID, formatIDR, getPeriodRange, toMonthKey } from '../utils/formatters';
import { CashflowBarChart, CategoryBreakdownList } from '../components/ui/Charts';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';

interface DashboardViewProps {
  onNavigate: (tab: NavTabId) => void;
  onOpenNewTx: (type: TransactionType) => void;
  onOpenCsvImport: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

const PERIOD_OPTIONS: { id: PeriodPreset; label: string }[] = [
  { id: 'today', label: 'Hari Ini' },
  { id: '7d', label: '7 Hari' },
  { id: 'this_month', label: 'Bulan Ini' },
  { id: 'last_month', label: 'Bulan Lalu' },
  { id: 'this_year', label: 'Tahun Ini' },
  { id: 'custom', label: 'Rentang' },
];

export function DashboardView({
  onNavigate,
  onOpenNewTx,
  onOpenCsvImport,
  onSelectTransaction,
}: DashboardViewProps) {
  const {
    state,
    activeAccounts,
    totalBalance,
    negativeAccounts,
    updatePreferences,
    loadDemoData,
  } = useFinance();

  const [preset, setPreset] = useState<PeriodPreset>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  const hidden = state.preferences.hideBalances;
  const periodRange = useMemo(
    () => getPeriodRange(preset, customStart, customEnd),
    [preset, customStart, customEnd],
  );

  const metrics = useMemo(
    () =>
      computePeriodMetrics(
        state.transactions,
        state.categories,
        periodRange,
        selectedAccountId,
      ),
    [state.transactions, state.categories, periodRange, selectedAccountId],
  );

  const currentMonthKey = toMonthKey(new Date().toISOString().slice(0, 10));
  const budgets = useMemo(
    () =>
      computeBudgetProgress(
        state.budgets,
        state.transactions,
        state.categories,
        currentMonthKey,
      ),
    [state.budgets, state.transactions, state.categories, currentMonthKey],
  );

  const goalSummaries = useMemo(
    () => state.savingsGoals.map(computeSavingsGoalSummary).slice(0, 3),
    [state.savingsGoals],
  );

  // Calendar days for current month activity widget
  const calendarDays = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const firstDayWeekday = (new Date(y, m, 1).getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const monthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;

    const dayTotals = new Map<string, { income: number; expense: number; count: number }>();
    for (const tx of state.transactions) {
      if (tx.date.slice(0, 7) !== monthPrefix) continue;
      const d = tx.date.slice(0, 10);
      const cur = dayTotals.get(d) || { income: 0, expense: 0, count: 0 };
      cur.count += 1;
      if (tx.type === 'income') cur.income += tx.amount;
      if (tx.type === 'expense') cur.expense += tx.amount;
      dayTotals.set(d, cur);
    }

    const cells: {
      dayNum: number | null;
      dateStr?: string;
      income: number;
      expense: number;
      count: number;
    }[] = [];
    for (let i = 0; i < firstDayWeekday; i += 1) {
      cells.push({ dayNum: null, income: 0, expense: 0, count: 0 });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      const dateStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
      const info = dayTotals.get(dateStr) || { income: 0, expense: 0, count: 0 };
      cells.push({ dayNum: d, dateStr, ...info });
    }
    return {
      monthLabel: new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now),
      cells,
    };
  }, [state.transactions]);

  const selectedDayTransactions = useMemo(() => {
    if (!selectedCalendarDay) return [];
    return state.transactions.filter((tx) => tx.date.slice(0, 10) === selectedCalendarDay);
  }, [state.transactions, selectedCalendarDay]);

  const isBrandNewEmpty = state.accounts.length === 0 && state.transactions.length === 0;
  const firstName = state.preferences.displayName.trim().split(' ')[0] || 'Sobat Finora';
  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  if (isBrandNewEmpty) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow={todayLabel}
          title={`Selamat datang, ${firstName}`}
          description="Pusat kendali keuangan pribadi Anda masih kosong. Mulai dengan membuat akun rekening, e-wallet, atau dompet tunai pertama Anda—atau muat data contoh untuk mencoba seluruh fitur langsung."
        />

        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('accounts')}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Buat Akun Pertama
            </button>
            <button
              type="button"
              onClick={loadDemoData}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Muat Data Contoh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">1. Tambah Akun & Saldo Awal</h2>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              Catat rekening bank, GoPay/OVO/DANA, atau uang tunai tanpa perlu memasukkan PIN atau
              kata sandi perbankan.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-income-soft text-income flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">2. Catat atau Impor CSV</h2>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              Catat pemasukan, pengeluaran, dan transfer internal dengan bukti struk foto, atau impor
              mutasi dari file CSV.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-expense-soft text-expense flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">3. Pantau Anggaran & AI</h2>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">
              Atur batas pengeluaran bulanan, target tabungan, dan konsultasikan kondisi keuangan
              dengan Asisten AI.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={todayLabel}
        title={`Halo, ${firstName}`}
        description="Ringkasan saldo dan arus kas Anda. Filter periode di bagian Arus Kas hanya memengaruhi metrik, grafik, dan daftar transaksi—bukan total saldo aktif."
      />

      {/* Negative Balance Warning Banner if applicable */}
      {negativeAccounts.length > 0 && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-warning-soft border border-warning/40 text-sm text-warning-strong"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Peringatan Saldo Negatif:</strong>{' '}
              {negativeAccounts.map((a) => `${a.name} (${formatIDR(a.currentBalance)})`).join(', ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('accounts')}
            className="inline-flex min-h-[44px] items-center px-1 -my-2 text-xs font-semibold text-warning-strong underline whitespace-nowrap self-start sm:self-auto"
          >
            Periksa Akun
          </button>
        </div>
      )}

      {/* Hero Balance + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Total Saldo Aktif · {activeAccounts.filter((a) => a.includeInTotal).length} akun
              </p>
              <p
                className={`mt-2 text-[clamp(1.55rem,5.6vw,2.25rem)] font-mono font-bold leading-tight tabular-nums tracking-tight ${
                  totalBalance < 0 ? 'text-expense' : 'text-text-primary'
                }`}
              >
                {formatIDR(totalBalance, { hidden })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updatePreferences({ hideBalances: !hidden })}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
              aria-label={hidden ? 'Tampilkan nominal saldo' : 'Sembunyikan nominal saldo'}
              title={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
            >
              {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-text-secondary">
            <span>
              {activeAccounts.filter((a) => a.includeInTotal).length} akun masuk perhitungan
            </span>
            <button
              type="button"
              onClick={() => onNavigate('accounts')}
              className="inline-flex min-h-[44px] -my-2 items-center gap-1 whitespace-nowrap font-medium text-primary hover:text-primary-dark"
            >
              Kelola Akun <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Aksi Cepat</h2>
            <span className="text-xs text-text-secondary">Catat langsung atau impor mutasi</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => onOpenNewTx('income')}
              className="min-h-[72px] p-3 rounded-xl border border-border hover:border-income/50 hover:bg-income-soft/40 flex flex-col items-start justify-between text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-income-soft text-income flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text-primary mt-2">Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNewTx('expense')}
              className="min-h-[72px] p-3 rounded-xl border border-border hover:border-expense/50 hover:bg-expense-soft/40 flex flex-col items-start justify-between text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-expense-soft text-expense flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text-primary mt-2">Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNewTx('transfer')}
              className="min-h-[72px] p-3 rounded-xl border border-border hover:border-info/50 hover:bg-info-soft flex flex-col items-start justify-between text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-info-soft text-info flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text-primary mt-2">Transfer</span>
            </button>
            <button
              type="button"
              onClick={onOpenCsvImport}
              className="min-h-[72px] p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary-soft/40 flex flex-col items-start justify-between text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text-primary mt-2">Impor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cashflow scope: filters only affect the metrics/charts/transactions below */}
      <section aria-labelledby="cashflow-title" className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="cashflow-title" className="text-base font-semibold text-text-primary">
              Arus Kas
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary">
              {periodRange.label} · Filter ini memengaruhi metrik, grafik, dan daftar transaksi di
              bawah, bukan total saldo.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <div
              role="group"
              aria-label="Pilih periode arus kas"
              className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreset(opt.id)}
                  aria-pressed={preset === opt.id}
                  className={`min-h-[40px] whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    preset === opt.id
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {preset === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart || periodRange.startDate}
                  onChange={(event) => setCustomStart(event.target.value)}
                  aria-label="Tanggal mulai arus kas"
                  className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text-primary sm:flex-none"
                />
                <span className="text-xs text-text-secondary">s/d</span>
                <input
                  type="date"
                  value={customEnd || periodRange.endDate}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  aria-label="Tanggal akhir arus kas"
                  className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text-primary sm:flex-none"
                />
              </div>
            )}

            <select
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              aria-label="Filter akun dashboard"
              className="min-h-[40px] rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-primary"
            >
              <option value="all">Semua Akun ({activeAccounts.length})</option>
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-text-secondary">Pemasukan Periode Ini</p>
          <p className="mt-1.5 text-xl font-mono font-semibold tabular-nums text-income">
            {hidden ? 'Rp•••••••' : `+${formatIDR(metrics.totalIncome)}`}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {metrics.incomeChangePct !== null
              ? `${metrics.incomeChangePct >= 0 ? '+' : ''}${metrics.incomeChangePct}% dibanding periode lalu`
              : 'Belum ada data pembanding'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-text-secondary">Pengeluaran Periode Ini</p>
          <p className="mt-1.5 text-xl font-mono font-semibold tabular-nums text-expense">
            {hidden ? 'Rp•••••••' : `−${formatIDR(metrics.totalExpense)}`}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {metrics.expenseChangePct !== null
              ? `${metrics.expenseChangePct >= 0 ? '+' : ''}${metrics.expenseChangePct}% dibanding periode lalu`
              : `Rata-rata ${formatIDR(metrics.averageDailyExpense, { hidden })}/hari`}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-text-secondary">Arus Kas Bersih</p>
          <p
            className={`mt-1.5 text-xl font-mono font-semibold tabular-nums ${
              metrics.netCashflow >= 0 ? 'text-text-primary' : 'text-expense'
            }`}
          >
            {formatIDR(metrics.netCashflow, { hidden })}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Pemasukan dikurangi pengeluaran</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-text-secondary">Transfer Internal</p>
          <p className="mt-1.5 text-xl font-mono font-semibold tabular-nums text-info">
            {formatIDR(metrics.totalTransfer, { hidden })}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Tidak dihitung sebagai pengeluaran</p>
        </div>
        </div>
      </section>

      {/* Main Content Grid: Desktop 12-col split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 columns */}
        <div className="lg:col-span-8 space-y-5">
          {/* Cashflow Chart */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Grafik Arus Kas Harian</h2>
                <p className="text-xs text-text-secondary mt-0.5">{periodRange.label}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="inline-flex min-h-[44px] -my-2 items-center px-1 text-xs font-medium text-primary hover:text-primary-dark whitespace-nowrap"
              >
                Analisis Lengkap
              </button>
            </div>
            <CashflowBarChart
              points={metrics.dailyPoints}
              periodLabel={periodRange.label}
              hidden={hidden}
            />
          </div>

          {/* Category Breakdown */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Pengeluaran per Kategori
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Total pengeluaran: {formatIDR(metrics.totalExpense, { hidden })}
                </p>
              </div>
            </div>
            <CategoryBreakdownList
              items={metrics.categoryBreakdown.slice(0, 6)}
              totalExpense={metrics.totalExpense}
              hidden={hidden}
            />
          </div>

          {/* Recent Transactions */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-semibold text-text-primary">Transaksi Terbaru</h2>
              <button
                type="button"
                onClick={() => onNavigate('transactions')}
                className="inline-flex min-h-[44px] -my-2 items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark whitespace-nowrap"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {metrics.transactions.length === 0 ? (
              <EmptyState
                icon={<Wallet className="w-6 h-6" />}
                title="Belum ada transaksi pada periode ini"
                description="Catat pemasukan, pengeluaran, atau transfer pertama Anda pada periode ini."
                primaryAction={{
                  label: 'Catat Transaksi',
                  onClick: () => onOpenNewTx('expense'),
                }}
              />
            ) : (
              <div className="divide-y divide-border">
                {metrics.transactions.slice(0, 6).map((tx) => {
                  const cat = state.categories.find((c) => c.id === tx.categoryId);
                  const acc = activeAccounts.find((a) => a.id === tx.accountId);
                  return (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => onSelectTransaction(tx)}
                      className="w-full py-3.5 flex items-center justify-between gap-3 text-left hover:bg-surface-muted/80 -mx-2 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-income-soft text-income'
                              : tx.type === 'expense'
                              ? 'bg-expense-soft text-expense'
                              : 'bg-info-soft text-info'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : tx.type === 'expense' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowLeftRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {tx.description}
                            </p>
                            {tx.attachmentIds.length > 0 && (
                              <Paperclip
                                className="w-3.5 h-3.5 text-text-secondary shrink-0"
                                aria-label="Memiliki bukti transaksi"
                              />
                            )}
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {cat?.name || (tx.type === 'transfer' ? 'Transfer' : 'Penyesuaian')} ·{' '}
                            {acc?.name || 'Akun'} · {formatDateID(tx.date)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-sm font-semibold tabular-nums shrink-0 ${
                          tx.type === 'income'
                            ? 'text-income'
                            : tx.type === 'expense'
                            ? 'text-expense'
                            : 'text-text-primary'
                        }`}
                      >
                        {formatIDR(tx.amount, { signed: true, type: tx.type, hidden })}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 columns: Calendar Activity + Budgets + Savings */}
        <div className="lg:col-span-4 space-y-5">
          {/* Financial Activity Calendar Widget */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-text-primary">Kalender Arus Kas</h2>
              </div>
              <span className="text-xs text-text-secondary">{calendarDays.monthLabel}</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-text-secondary mb-1.5">
              <span>Sn</span>
              <span>Sl</span>
              <span>Rb</span>
              <span>Km</span>
              <span>Jm</span>
              <span>Sb</span>
              <span>Mg</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.cells.map((cell, idx) => {
                if (!cell.dayNum || !cell.dateStr) {
                  return <div key={idx} className="h-10" />;
                }
                const isSelected = selectedCalendarDay === cell.dateStr;
                const hasActivity = cell.count > 0;
                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedCalendarDay(isSelected ? null : cell.dateStr!)}
                    aria-pressed={isSelected}
                    aria-label={`${formatDateID(cell.dateStr)}${
                      cell.count > 0 ? `, ${cell.count} transaksi` : ', tidak ada transaksi'
                    }`}
                    className={`flex h-10 min-w-0 flex-col items-center justify-center rounded-lg text-xs font-mono tabular-nums transition-colors ${
                      isSelected
                        ? 'bg-primary font-semibold text-white'
                        : hasActivity
                        ? 'bg-primary-soft/70 text-text-primary hover:bg-primary-soft'
                        : 'text-text-secondary hover:bg-surface-muted'
                    }`}
                  >
                    <span>{cell.dayNum}</span>
                    {hasActivity && (
                      <span
                        className={`mt-0.5 h-1 w-1 rounded-full ${
                          isSelected
                            ? 'bg-surface'
                            : cell.income > cell.expense
                            ? 'bg-income'
                            : 'bg-expense'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedCalendarDay && (
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <p className="text-xs font-semibold text-text-primary">
                  Aktivitas {formatDateID(selectedCalendarDay)}
                </p>
                {selectedDayTransactions.length === 0 ? (
                  <p className="text-xs text-text-secondary">Tidak ada transaksi pada tanggal ini.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDayTransactions.slice(0, 4).map((tx) => (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => onSelectTransaction(tx)}
                        className="w-full flex items-center justify-between gap-2 text-xs py-1 hover:bg-surface-muted rounded px-1.5 text-left"
                      >
                        <span className="truncate text-text-primary">{tx.description}</span>
                        <span className="font-mono tabular-nums shrink-0 text-text-secondary">
                          {formatIDR(tx.amount, { signed: true, type: tx.type, hidden })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Budget Summary */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-primary">Ringkasan Anggaran</h2>
              <button
                type="button"
                onClick={() => onNavigate('budgets')}
                className="inline-flex min-h-[44px] -my-2 items-center gap-1 px-1 text-xs font-medium text-primary hover:text-primary-dark whitespace-nowrap"
              >
                Kelola <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {budgets.length === 0 ? (
              <p className="text-xs text-text-secondary leading-relaxed">
                Belum ada anggaran bulan ini. Buat batas pengeluaran kategori untuk memantau
                pemakaian secara otomatis.
              </p>
            ) : (
              <div className="space-y-3">
                {budgets.slice(0, 4).map((b) => (
                  <div key={b.budget.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-text-primary truncate">{b.categoryName}</span>
                      <span
                        className={`font-mono tabular-nums ${
                          b.status === 'melebihi'
                            ? 'text-expense font-semibold'
                            : b.status === 'peringatan'
                            ? 'text-warning font-semibold'
                            : 'text-text-secondary'
                        }`}
                      >
                        {b.percentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          b.status === 'melebihi'
                            ? 'bg-expense'
                            : b.status === 'peringatan'
                            ? 'bg-warning'
                            : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Savings Goals Summary */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-primary">Target Tabungan</h2>
              <button
                type="button"
                onClick={() => onNavigate('savings')}
                className="inline-flex min-h-[44px] -my-2 items-center px-1 text-xs font-medium text-primary hover:text-primary-dark"
              >
                Lihat Target
              </button>
            </div>
            {goalSummaries.length === 0 ? (
              <p className="text-xs text-text-secondary leading-relaxed">
                Belum ada target tabungan. Buat target seperti Dana Darurat atau Pembelian Alat Kerja.
              </p>
            ) : (
              <div className="space-y-3.5">
                {goalSummaries.map((item) => (
                  <div key={item.goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-text-primary truncate">{item.goal.name}</span>
                      <span className="font-mono tabular-nums text-income font-semibold shrink-0">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-income"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-mono tabular-nums text-text-secondary">
                      {formatIDR(item.savedAmount, { hidden })} /{' '}
                      {formatIDR(item.goal.targetAmount, { hidden })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
