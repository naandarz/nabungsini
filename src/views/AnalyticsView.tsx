import { useMemo, useState } from 'react';
import { BarChart3, Download, Info } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PeriodPreset } from '../types/finance';
import { exportTransactionsToCsv } from '../utils/csvEngine';
import {
  computeMonthlySeries,
  computePeriodMetrics,
} from '../utils/financeEngine';
import { formatIDR, getPeriodRange } from '../utils/formatters';
import { CategoryBreakdownList, MonthlyComparisonChart } from '../components/ui/Charts';
import { PageHeader } from '../components/ui/PageHeader';

export function AnalyticsView() {
  const { state, accountsWithBalances, totalBalance, showToast } = useFinance();
  const [preset, setPreset] = useState<PeriodPreset>('this_month');
  const hidden = state.preferences.hideBalances;

  const periodRange = useMemo(() => getPeriodRange(preset), [preset]);
  const metrics = useMemo(
    () => computePeriodMetrics(state.transactions, state.categories, periodRange, 'all'),
    [state.transactions, state.categories, periodRange],
  );
  const monthlySeries = useMemo(
    () => computeMonthlySeries(state.transactions, 6),
    [state.transactions],
  );

  // Transparent educational indicator (only computed from real user data)
  const savingsRatePct =
    metrics.totalIncome > 0
      ? Math.round(((metrics.totalIncome - metrics.totalExpense) / metrics.totalIncome) * 100)
      : null;

  const handleExportPeriodCsv = () => {
    if (metrics.transactions.length === 0) {
      showToast('warning', 'Tidak ada transaksi pada periode ini untuk diekspor.');
      return;
    }
    const csv = exportTransactionsToCsv(
      metrics.transactions,
      accountsWithBalances,
      state.categories,
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora-laporan-${periodRange.startDate}-${periodRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Laporan transaksi periode berhasil diekspor.');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analisis & Laporan"
        description="Seluruh metrik dihitung langsung dari buku besar transaksi tanpa transfer ganda."
        actions={
          <>
            <div className="flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1">
              {(
                [
                  ['7d', '7 Hari'],
                  ['this_month', 'Bulan Ini'],
                  ['last_month', 'Bulan Lalu'],
                  ['this_year', 'Tahun Ini'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPreset(id)}
                  aria-pressed={preset === id}
                  className={`min-h-[40px] px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                    preset === id
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportPeriodCsv}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-text-primary inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-primary" />
              Ekspor Laporan CSV
            </button>
          </>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs text-text-secondary">Total Pemasukan ({periodRange.label})</p>
          <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-income">
            {formatIDR(metrics.totalIncome, { hidden })}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs text-text-secondary">Total Pengeluaran ({periodRange.label})</p>
          <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-expense">
            {formatIDR(metrics.totalExpense, { hidden })}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs text-text-secondary">Rata-Rata Pengeluaran Harian</p>
          <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-text-primary">
            {formatIDR(metrics.averageDailyExpense, { hidden })}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
          <p className="text-xs text-text-secondary">Rasio Arus Kas Tersisa</p>
          <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-text-primary">
            {savingsRatePct !== null ? `${savingsRatePct}%` : 'Belum tersedia'}
          </p>
          <p className="mt-1 text-[11px] text-text-secondary">
            (Pemasukan − Pengeluaran) ÷ Pemasukan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Perbandingan 6 Bulan Terakhir
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Pemasukan dan pengeluaran per bulan (tidak termasuk transfer internal)
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <MonthlyComparisonChart series={monthlySeries} hidden={hidden} />
        </div>

        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-text-primary mb-1">
            Distribusi Pengeluaran Kategori
          </h2>
          <p className="text-xs text-text-secondary mb-4">{periodRange.label}</p>
          <CategoryBreakdownList
            items={metrics.categoryBreakdown}
            totalExpense={metrics.totalExpense}
            hidden={hidden}
          />
        </div>
      </div>

      {/* Educational Cashflow Note */}
      <div className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-text-secondary space-y-1">
          <p className="font-semibold text-text-primary">Catatan Pembukuan Finora</p>
          <p>
            Total saldo aktif Anda saat ini sebesar{' '}
            <span className="font-mono font-semibold text-text-primary">
              {formatIDR(totalBalance, { hidden })}
            </span>
            . Transfer internal pada periode ini ({formatIDR(metrics.totalTransfer, { hidden })})
            dicatat sebagai perpindahan dana antar-akun sehingga tidak memengaruhi rasio pengeluaran.
          </p>
        </div>
      </div>
    </div>
  );
}
