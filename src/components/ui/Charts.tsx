import { useState } from 'react';
import { CategoryBreakdownItem, DailyCashflowPoint } from '../../utils/financeEngine';
import { formatCompactIDR, formatDateID, formatIDR } from '../../utils/formatters';

interface CashflowChartProps {
  points: DailyCashflowPoint[];
  periodLabel: string;
  hidden?: boolean;
}

export function CashflowBarChart({ points, periodLabel, hidden = false }: CashflowChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl px-4">
        <p className="text-sm font-medium text-text-primary">Belum ada arus kas pada {periodLabel}</p>
        <p className="text-xs text-text-secondary mt-1">
          Grafik pemasukan dan pengeluaran harian akan tampil setelah ada transaksi pada periode ini.
        </p>
      </div>
    );
  }

  // Keep up to 14 most recent points on narrow displays or all points cleanly scaled
  const displayPoints = points.slice(-14);
  const maxVal = Math.max(
    1,
    ...displayPoints.map((p) => Math.max(p.income, p.expense)),
  );
  const activePoint = hoveredIdx !== null ? displayPoints[hoveredIdx] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-text-secondary">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-income" aria-hidden="true" />
            Pemasukan (IDR)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-expense" aria-hidden="true" />
            Pengeluaran (IDR)
          </span>
        </div>
        {activePoint ? (
          <div className="font-mono tabular-nums text-text-primary">
            {formatDateID(activePoint.date)} · +{formatIDR(activePoint.income, { hidden })} · −
            {formatIDR(activePoint.expense, { hidden })}
          </div>
        ) : (
          <span>Arahkan kursor atau ketuk batang untuk rincian</span>
        )}
      </div>

      <div className="relative h-52 flex items-end gap-1.5 sm:gap-2.5 pt-4 pb-6 border-b border-border">
        {displayPoints.map((pt, idx) => {
          const incPct = Math.max(pt.income > 0 ? 6 : 0, Math.round((pt.income / maxVal) * 100));
          const expPct = Math.max(pt.expense > 0 ? 6 : 0, Math.round((pt.expense / maxVal) * 100));
          const isActive = hoveredIdx === idx;
          return (
            <button
              key={pt.date}
              type="button"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setHoveredIdx(isActive ? null : idx)}
              className={`group flex-1 min-w-0 h-full flex flex-col justify-end items-center relative focus:outline-none rounded-lg px-0.5 transition-colors ${
                isActive ? 'bg-surface-muted' : 'hover:bg-surface-muted/70'
              }`}
              aria-label={`${formatDateID(pt.date)}: Pemasukan ${formatIDR(pt.income)}, Pengeluaran ${formatIDR(pt.expense)}`}
            >
              <div className="w-full h-full flex items-end justify-center gap-0.5 sm:gap-1 pb-1">
                <div
                  className="w-2 sm:w-3 rounded-t bg-income transition-all duration-150"
                  style={{ height: `${incPct}%` }}
                />
                <div
                  className="w-2 sm:w-3 rounded-t bg-expense transition-all duration-150"
                  style={{ height: `${expPct}%` }}
                />
              </div>
              <span className="absolute -bottom-5 text-[10px] font-mono tabular-nums text-text-secondary truncate max-w-full">
                {pt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MonthlyComparisonChartProps {
  series: { monthKey: string; label: string; income: number; expense: number; net: number }[];
  hidden?: boolean;
}

export function MonthlyComparisonChart({ series, hidden = false }: MonthlyComparisonChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const hasAny = series.some((s) => s.income > 0 || s.expense > 0);

  if (!hasAny) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl px-4">
        <p className="text-sm font-medium text-text-primary">Belum ada perbandingan bulanan</p>
        <p className="text-xs text-text-secondary mt-1">
          Catat pemasukan atau pengeluaran untuk melihat tren 6 bulan terakhir.
        </p>
      </div>
    );
  }

  const maxVal = Math.max(1, ...series.map((s) => Math.max(s.income, s.expense)));
  const active = activeIdx !== null ? series[activeIdx] : series[series.length - 1];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs">
        <div className="flex items-center gap-4 text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-income" aria-hidden="true" />
            Pemasukan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-expense" aria-hidden="true" />
            Pengeluaran
          </span>
        </div>
        {active && (
          <div className="font-mono tabular-nums text-text-primary">
            {active.label}: +{formatIDR(active.income, { hidden })} / −
            {formatIDR(active.expense, { hidden })}
          </div>
        )}
      </div>

      <div className="h-56 flex items-end gap-2 sm:gap-4 pt-2 pb-7 border-b border-border">
        {series.map((item, idx) => {
          const incPct = Math.max(item.income > 0 ? 5 : 0, Math.round((item.income / maxVal) * 100));
          const expPct = Math.max(
            item.expense > 0 ? 5 : 0,
            Math.round((item.expense / maxVal) * 100),
          );
          const isSelected = activeIdx === idx;
          return (
            <button
              key={item.monthKey}
              type="button"
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={() => setActiveIdx(idx)}
              className={`flex-1 h-full flex flex-col justify-end items-center relative rounded-xl px-1 transition-colors ${
                isSelected ? 'bg-surface-muted' : 'hover:bg-surface-muted/60'
              }`}
            >
              <div className="w-full h-full flex items-end justify-center gap-1.5 pb-1">
                <div
                  className="w-3 sm:w-5 rounded-t-md bg-income transition-all duration-150"
                  style={{ height: `${incPct}%` }}
                  title={`Pemasukan: ${formatCompactIDR(item.income)}`}
                />
                <div
                  className="w-3 sm:w-5 rounded-t-md bg-expense transition-all duration-150"
                  style={{ height: `${expPct}%` }}
                  title={`Pengeluaran: ${formatCompactIDR(item.expense)}`}
                />
              </div>
              <span className="absolute -bottom-6 text-[11px] font-medium text-text-secondary whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CategoryBreakdownListProps {
  items: CategoryBreakdownItem[];
  totalExpense: number;
  hidden?: boolean;
}

export function CategoryBreakdownList({
  items,
  totalExpense,
  hidden = false,
}: CategoryBreakdownListProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed border-border rounded-xl px-4">
        <p className="text-sm font-medium text-text-primary">Belum ada pengeluaran pada periode ini</p>
        <p className="text-xs text-text-secondary mt-1">
          Transfer internal tidak dihitung dalam pengeluaran kategori.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {items.map((item) => (
        <div key={item.categoryId} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="font-medium text-text-primary truncate">{item.name}</span>
              <span className="text-xs text-text-secondary shrink-0">· {item.count}x</span>
            </div>
            <div className="font-mono tabular-nums text-right shrink-0">
              <span className="font-medium text-text-primary">
                {formatIDR(item.amount, { hidden })}
              </span>
              <span className="text-xs text-text-secondary ml-2">({item.percentage}%)</span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${totalExpense > 0 ? Math.max(3, item.percentage) : 0}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
