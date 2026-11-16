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
            <div className="flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-[#E8E9F1] bg-white p-1">
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
                      ? 'bg-[#6655D9] text-white'
                      : 'text-[#74778B] hover:text-[#202238]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportPeriodCsv}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E8E9F1] bg-white hover:bg-[#F6F7FB] text-xs font-medium text-[#202238] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#6655D9]" />
              Ekspor Laporan CSV
            </button>
          </>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 sm:p-5">
          <p className="text-xs text-[#74778B]">Total Pemasukan ({periodRange.label})</p>
          <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-[#16A779]">
            {formatIDR(metrics.totalIncome, { hidden })}
          </p>
        </div>
        <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 sm:p-5">
          <p className="text-xs text-[#74778B]">Total Pengeluaran ({periodRange.label})</p>
          <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-[#E65378]">
            {formatIDR(metrics.totalExpense, { hidden })}
          </p>
        </div>
        <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 sm:p-5">
          <p className="text-xs text-[#74778B]">Rata-Rata Pengeluaran Harian</p>
          <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-[#202238]">
            {formatIDR(metrics.averageDailyExpense, { hidden })}
          </p>
        </div>
        <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 sm:p-5">
          <p className="text-xs text-[#74778B]">Rasio Arus Kas Tersisa</p>
          <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-[#202238]">
            {savingsRatePct !== null ? `${savingsRatePct}%` : 'Belum tersedia'}
          </p>
          <p className="mt-1 text-[11px] text-[#74778B]">
            (Pemasukan − Pengeluaran) ÷ Pemasukan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white border border-[#E8E9F1] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#202238]">
                Perbandingan 6 Bulan Terakhir
              </h2>
              <p className="text-xs text-[#74778B] mt-0.5">
                Pemasukan dan pengeluaran per bulan (tidak termasuk transfer internal)
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#6655D9]" />
          </div>
          <MonthlyComparisonChart series={monthlySeries} hidden={hidden} />
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E8E9F1] rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-[#202238] mb-1">
            Distribusi Pengeluaran Kategori
          </h2>
          <p className="text-xs text-[#74778B] mb-4">{periodRange.label}</p>
          <CategoryBreakdownList
            items={metrics.categoryBreakdown}
            totalExpense={metrics.totalExpense}
            hidden={hidden}
          />
        </div>
      </div>

      {/* Educational Cashflow Note */}
      <div className="bg-white border border-[#E8E9F1] rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#3989D8] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-[#74778B] space-y-1">
          <p className="font-semibold text-[#202238]">Catatan Pembukuan Finora</p>
          <p>
            Total saldo aktif Anda saat ini sebesar{' '}
            <span className="font-mono font-semibold text-[#202238]">
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
