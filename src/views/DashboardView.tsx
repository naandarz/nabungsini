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

        <div className="rounded-2xl border border-[#E8E9F1] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('accounts')}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-[#6655D9] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4938B5]"
            >
              <Plus className="h-4 w-4" />
              Buat Akun Pertama
            </button>
            <button
              type="button"
              onClick={loadDemoData}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-[#E8E9F1] bg-white px-5 py-2.5 text-sm font-medium text-[#202238] transition-colors hover:bg-[#F6F7FB]"
            >
              <Sparkles className="h-4 w-4 text-[#6655D9]" />
              Muat Data Contoh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] text-[#6655D9] flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#202238]">1. Tambah Akun & Saldo Awal</h2>
            <p className="mt-1 text-sm text-[#74778B] leading-relaxed">
              Catat rekening bank, GoPay/OVO/DANA, atau uang tunai tanpa perlu memasukkan PIN atau
              kata sandi perbankan.
            </p>
          </div>
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8F1] text-[#16A779] flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#202238]">2. Catat atau Impor CSV</h2>
            <p className="mt-1 text-sm text-[#74778B] leading-relaxed">
              Catat pemasukan, pengeluaran, dan transfer internal dengan bukti struk foto, atau impor
              mutasi dari file CSV.
            </p>
          </div>
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E65378] flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#202238]">3. Pantau Anggaran & AI</h2>
            <p className="mt-1 text-sm text-[#74778B] leading-relaxed">
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
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#FFF8EB] border border-[#E5A13A]/40 text-sm text-[#8A5A10]"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#E5A13A] shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Peringatan Saldo Negatif:</strong>{' '}
              {negativeAccounts.map((a) => `${a.name} (${formatIDR(a.currentBalance)})`).join(', ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('accounts')}
            className="inline-flex min-h-[44px] items-center px-1 -my-2 text-xs font-semibold text-[#8A5A10] underline whitespace-nowrap self-start sm:self-auto"
          >
            Periksa Akun
          </button>
        </div>
      )}

      {/* Hero Balance + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5 bg-white border border-[#E8E9F1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#74778B]">
                Total Saldo Aktif · {activeAccounts.filter((a) => a.includeInTotal).length} akun
              </p>
              <p
                className={`mt-2 text-[clamp(1.55rem,5.6vw,2.25rem)] font-mono font-bold leading-tight tabular-nums tracking-tight ${
                  totalBalance < 0 ? 'text-[#E65378]' : 'text-[#202238]'
                }`}
              >
                {formatIDR(totalBalance, { hidden })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updatePreferences({ hideBalances: !hidden })}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#E8E9F1] text-[#74778B] hover:text-[#202238] hover:bg-[#F6F7FB] transition-colors"
              aria-label={hidden ? 'Tampilkan nominal saldo' : 'Sembunyikan nominal saldo'}
              title={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
            >
              {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E8E9F1] pt-4 text-xs text-[#74778B]">
            <span>
              {activeAccounts.filter((a) => a.includeInTotal).length} akun masuk perhitungan
            </span>
            <button
              type="button"
              onClick={() => onNavigate('accounts')}
              className="inline-flex min-h-[44px] -my-2 items-center gap-1 whitespace-nowrap font-medium text-[#6655D9] hover:text-[#4938B5]"
            >
              Kelola Akun <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-7 bg-white border border-[#E8E9F1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#202238]">Aksi Cepat</h2>
            <span className="text-xs text-[#74778B]">Catat langsung atau impor mutasi</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => onOpenNewTx('income')}
              className="min-h-[72px] p-3 rounded-xl border border-[#E8E9F1] hover:border-[#16A779]/50 hover:bg-[#E8F8F1]/40 flex flex-col items-start justify-between text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E8F8F1] text-[#16A779] flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#202238] mt-2">Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNewTx('expense')}
              className="min-h-[72px] p-3 rounded-xl border border-[#E8E9F1] hover:border-[#E65378]/50 hover:bg-[#FFF0F3]/40 flex flex-col items-start justify-between text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#E65378] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#202238] mt-2">Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNewTx('transfer')}
              className="min-h-[72px] p-3 rounded-xl border border-[#E8E9F1] hover:border-[#3989D8]/50 hover:bg-[#F0F7FF] flex flex-col items-start justify-between text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#EEF6FF] text-[#3989D8] flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#202238] mt-2">Transfer</span>
            </button>
            <button
              type="button"
              onClick={onOpenCsvImport}
              className="min-h-[72px] p-3 rounded-xl border border-[#E8E9F1] hover:border-[#6655D9]/50 hover:bg-[#F0EDFF]/40 flex flex-col items-start justify-between text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F0EDFF] text-[#6655D9] flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#202238] mt-2">Impor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cashflow scope: filters only affect the metrics/charts/transactions below */}
      <section aria-labelledby="cashflow-title" className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="cashflow-title" className="text-base font-semibold text-[#202238]">
              Arus Kas
            </h2>
            <p className="mt-0.5 text-xs text-[#74778B]">
              {periodRange.label} · Filter ini memengaruhi metrik, grafik, dan daftar transaksi di
              bawah, bukan total saldo.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <div
              role="group"
              aria-label="Pilih periode arus kas"
              className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E8E9F1] bg-white p-1"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreset(opt.id)}
                  aria-pressed={preset === opt.id}
                  className={`min-h-[40px] whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    preset === opt.id
                      ? 'bg-[#6655D9] text-white'
                      : 'text-[#74778B] hover:bg-[#F6F7FB] hover:text-[#202238]'
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
                  className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-[#E8E9F1] bg-white px-3 py-1.5 text-xs text-[#202238] sm:flex-none"
                />
                <span className="text-xs text-[#74778B]">s/d</span>
                <input
                  type="date"
                  value={customEnd || periodRange.endDate}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  aria-label="Tanggal akhir arus kas"
                  className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-[#E8E9F1] bg-white px-3 py-1.5 text-xs text-[#202238] sm:flex-none"
                />
              </div>
            )}

            <select
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              aria-label="Filter akun dashboard"
              className="min-h-[40px] rounded-xl border border-[#E8E9F1] bg-white px-3.5 py-1.5 text-xs font-medium text-[#202238]"
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
        <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#74778B]">Pemasukan Periode Ini</p>
          <p className="mt-1.5 text-xl font-mono font-semibold tabular-nums text-[#16A779]">
            {hidden ? 'Rp•••••••' : `+${formatIDR(metrics.totalIncome)}`}
          </p>
          <p className="mt-1 text-xs text-[#74778B]">
            {metrics.incomeChangePct !== null
              ? `${metrics.incomeChangePct >= 0 ? '+' : ''}${metrics.incomeChangePct}% dibanding periode lalu`
              : 'Belum ada data pembanding'}
          </p>
        </div>

        <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#74778B]">Pengeluaran Periode Ini</p>
          <p className="mt-1.5 text-xl font-mono font-semibold tabular-nums text-[#E65378]">
            {hidden ? 'Rp•••••••' : `−${formatIDR(metrics.totalExpense)}`}
          </p>
          <p className="mt-1 text-xs text-[#74778B]">
            {metrics.expenseChangePct !== null
              ? `${metrics.expenseChangePct >= 0 ? '+' : ''}${metrics.expenseChangePct}% dibanding periode lalu`
              : `Rata-rata ${formatIDR(metrics.averageDailyExpense, { hidden })}/hari`}
          </p>
        </div>

        <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#74778B]">Arus Kas Bersih</p>
          <p
            className={`mt-1.5 text-xl font-mono font-semibold tabular-nums ${
              metrics.netCashflow >= 0 ? 'text-[#202238]' : 'text-[#E65378]'
            }`}
          >
            {formatIDR(metrics.netCashflow, { hidden })}
          </p>
          <p className="mt-1 text-xs text-[#74778B]">Pemasukan dikurangi pengeluaran</p>
        </div>

        <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#74778B]">Transfer Internal</p>
          <p className="mt-1.5 text-xl font-mono font-semibold tabular-nums text-[#3989D8]">
            {formatIDR(metrics.totalTransfer, { hidden })}
          </p>
          <p className="mt-1 text-xs text-[#74778B]">Tidak dihitung sebagai pengeluaran</p>
        </div>
        </div>
      </section>

      {/* Main Content Grid: Desktop 12-col split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 columns */}
        <div className="lg:col-span-8 space-y-5">
          {/* Cashflow Chart */}
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#202238]">Grafik Arus Kas Harian</h2>
                <p className="text-xs text-[#74778B] mt-0.5">{periodRange.label}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="inline-flex min-h-[44px] -my-2 items-center px-1 text-xs font-medium text-[#6655D9] hover:text-[#4938B5] whitespace-nowrap"
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
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#202238]">
                  Pengeluaran per Kategori
                </h2>
                <p className="text-xs text-[#74778B] mt-0.5">
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
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-semibold text-[#202238]">Transaksi Terbaru</h2>
              <button
                type="button"
                onClick={() => onNavigate('transactions')}
                className="inline-flex min-h-[44px] -my-2 items-center gap-1 text-xs font-medium text-[#6655D9] hover:text-[#4938B5] whitespace-nowrap"
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
              <div className="divide-y divide-[#E8E9F1]">
                {metrics.transactions.slice(0, 6).map((tx) => {
                  const cat = state.categories.find((c) => c.id === tx.categoryId);
                  const acc = activeAccounts.find((a) => a.id === tx.accountId);
                  return (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => onSelectTransaction(tx)}
                      className="w-full py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F6F7FB]/80 -mx-2 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-[#E8F8F1] text-[#16A779]'
                              : tx.type === 'expense'
                              ? 'bg-[#FFF0F3] text-[#E65378]'
                              : 'bg-[#EEF6FF] text-[#3989D8]'
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
                            <p className="text-sm font-medium text-[#202238] truncate">
                              {tx.description}
                            </p>
                            {tx.attachmentIds.length > 0 && (
                              <Paperclip
                                className="w-3.5 h-3.5 text-[#74778B] shrink-0"
                                aria-label="Memiliki bukti transaksi"
                              />
                            )}
                          </div>
                          <p className="text-xs text-[#74778B] truncate mt-0.5">
                            {cat?.name || (tx.type === 'transfer' ? 'Transfer' : 'Penyesuaian')} ·{' '}
                            {acc?.name || 'Akun'} · {formatDateID(tx.date)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-sm font-semibold tabular-nums shrink-0 ${
                          tx.type === 'income'
                            ? 'text-[#16A779]'
                            : tx.type === 'expense'
                            ? 'text-[#E65378]'
                            : 'text-[#202238]'
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
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#6655D9]" />
                <h2 className="text-sm font-semibold text-[#202238]">Kalender Arus Kas</h2>
              </div>
              <span className="text-xs text-[#74778B]">{calendarDays.monthLabel}</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[#74778B] mb-1.5">
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
                        ? 'bg-[#6655D9] font-semibold text-white'
                        : hasActivity
                        ? 'bg-[#F0EDFF]/70 text-[#202238] hover:bg-[#F0EDFF]'
                        : 'text-[#74778B] hover:bg-[#F6F7FB]'
                    }`}
                  >
                    <span>{cell.dayNum}</span>
                    {hasActivity && (
                      <span
                        className={`mt-0.5 h-1 w-1 rounded-full ${
                          isSelected
                            ? 'bg-white'
                            : cell.income > cell.expense
                            ? 'bg-[#16A779]'
                            : 'bg-[#E65378]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedCalendarDay && (
              <div className="mt-3 pt-3 border-t border-[#E8E9F1] space-y-2">
                <p className="text-xs font-semibold text-[#202238]">
                  Aktivitas {formatDateID(selectedCalendarDay)}
                </p>
                {selectedDayTransactions.length === 0 ? (
                  <p className="text-xs text-[#74778B]">Tidak ada transaksi pada tanggal ini.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDayTransactions.slice(0, 4).map((tx) => (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => onSelectTransaction(tx)}
                        className="w-full flex items-center justify-between gap-2 text-xs py-1 hover:bg-[#F6F7FB] rounded px-1.5 text-left"
                      >
                        <span className="truncate text-[#202238]">{tx.description}</span>
                        <span className="font-mono tabular-nums shrink-0 text-[#74778B]">
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
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#202238]">Ringkasan Anggaran</h2>
              <button
                type="button"
                onClick={() => onNavigate('budgets')}
                className="inline-flex min-h-[44px] -my-2 items-center gap-1 px-1 text-xs font-medium text-[#6655D9] hover:text-[#4938B5] whitespace-nowrap"
              >
                Kelola <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {budgets.length === 0 ? (
              <p className="text-xs text-[#74778B] leading-relaxed">
                Belum ada anggaran bulan ini. Buat batas pengeluaran kategori untuk memantau
                pemakaian secara otomatis.
              </p>
            ) : (
              <div className="space-y-3">
                {budgets.slice(0, 4).map((b) => (
                  <div key={b.budget.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#202238] truncate">{b.categoryName}</span>
                      <span
                        className={`font-mono tabular-nums ${
                          b.status === 'melebihi'
                            ? 'text-[#E65378] font-semibold'
                            : b.status === 'peringatan'
                            ? 'text-[#E5A13A] font-semibold'
                            : 'text-[#74778B]'
                        }`}
                      >
                        {b.percentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F6F7FB] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          b.status === 'melebihi'
                            ? 'bg-[#E65378]'
                            : b.status === 'peringatan'
                            ? 'bg-[#E5A13A]'
                            : 'bg-[#6655D9]'
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
          <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#202238]">Target Tabungan</h2>
              <button
                type="button"
                onClick={() => onNavigate('savings')}
                className="inline-flex min-h-[44px] -my-2 items-center px-1 text-xs font-medium text-[#6655D9] hover:text-[#4938B5]"
              >
                Lihat Target
              </button>
            </div>
            {goalSummaries.length === 0 ? (
              <p className="text-xs text-[#74778B] leading-relaxed">
                Belum ada target tabungan. Buat target seperti Dana Darurat atau Pembelian Alat Kerja.
              </p>
            ) : (
              <div className="space-y-3.5">
                {goalSummaries.map((item) => (
                  <div key={item.goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[#202238] truncate">{item.goal.name}</span>
                      <span className="font-mono tabular-nums text-[#16A779] font-semibold shrink-0">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F6F7FB] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#16A779]"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-mono tabular-nums text-[#74778B]">
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
