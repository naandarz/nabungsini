import React, { useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Copy, Plus, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { computeBudgetProgress } from '../utils/financeEngine';
import { formatIDR, formatMonthKeyID, toMonthKey } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { AppModal } from '../components/ui/AppModal';

export function BudgetsView() {
  const { state, upsertBudget, deleteBudget, copyBudgetsFromMonth } = useFinance();
  const [monthKey, setMonthKey] = useState(() => toMonthKey(new Date().toISOString().slice(0, 10)));
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [limitStr, setLimitStr] = useState('');
  const [threshold, setThreshold] = useState(state.preferences.defaultWarningThreshold || 80);

  const hidden = state.preferences.hideBalances;
  const expenseCategories = useMemo(
    () => state.categories.filter((c) => c.type === 'expense'),
    [state.categories],
  );

  const progressList = useMemo(
    () => computeBudgetProgress(state.budgets, state.transactions, state.categories, monthKey),
    [state.budgets, state.transactions, state.categories, monthKey],
  );

  const totals = useMemo(() => {
    const limit = progressList.reduce((s, b) => s + b.budget.limitAmount, 0);
    const spent = progressList.reduce((s, b) => s + b.spent, 0);
    return { limit, spent, remaining: limit - spent };
  }, [progressList]);

  const prevMonthKey = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [monthKey]);

  const openModal = (prefillCatId?: string, prefillLimit?: number, prefillThreshold?: number) => {
    setCategoryId(prefillCatId || expenseCategories[0]?.id || '');
    setLimitStr(prefillLimit ? String(prefillLimit) : '');
    setThreshold(prefillThreshold || state.preferences.defaultWarningThreshold || 80);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLimit = parseInt(limitStr.replace(/[^\d]/g, ''), 10) || 0;
    if (!categoryId || cleanLimit <= 0) return;
    upsertBudget(categoryId, monthKey, cleanLimit, threshold);
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Perencanaan Anggaran"
        description="Transfer internal tidak dihitung sebagai pemakaian anggaran pengeluaran."
        actions={
          <>
            <input
              type="month"
              value={monthKey}
              onChange={(e) => setMonthKey(e.target.value)}
              aria-label="Pilih bulan anggaran"
              className="min-h-[44px] px-3 py-2 rounded-xl border border-border bg-surface text-xs sm:text-sm font-medium text-text-primary"
            />
            <button
              type="button"
              onClick={() => copyBudgetsFromMonth(prevMonthKey, monthKey)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs sm:text-sm font-medium text-text-primary inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Copy className="w-4 h-4 text-text-secondary" />
              Salin Bulan Lalu
            </button>
            <button
              type="button"
              onClick={() => openModal()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Atur Anggaran
            </button>
          </>
        }
      />

      {/* Totals Banner */}
      {progressList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
            <p className="text-xs text-text-secondary">Total Batas ({formatMonthKeyID(monthKey)})</p>
            <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-text-primary">
              {formatIDR(totals.limit, { hidden })}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
            <p className="text-xs text-text-secondary">Realisasi Pengeluaran</p>
            <p className="mt-1.5 text-xl font-mono font-bold tabular-nums text-expense">
              {formatIDR(totals.spent, { hidden })}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5">
            <p className="text-xs text-text-secondary">Sisa Anggaran</p>
            <p
              className={`mt-1.5 text-xl font-mono font-bold tabular-nums ${
                totals.remaining < 0 ? 'text-expense' : 'text-income'
              }`}
            >
              {formatIDR(totals.remaining, { hidden })}
            </p>
          </div>
        </div>
      )}

      {progressList.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-6 h-6" />}
          title={`Belum ada anggaran untuk ${formatMonthKeyID(monthKey)}`}
          description="Tetapkan batas pengeluaran per kategori agar Finora dapat memberi peringatan sebelum pengeluaran melebihi rencana."
          primaryAction={{
            label: 'Buat Anggaran Pertama',
            onClick: () => openModal(),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressList.map((item) => {
            const statusIcon =
              item.status === 'melebihi' ? (
                <AlertCircle className="w-4 h-4 text-expense" />
              ) : item.status === 'peringatan' ? (
                <AlertTriangle className="w-4 h-4 text-warning" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-income" />
              );

            const statusText =
              item.status === 'melebihi'
                ? `Melebihi batas ${formatIDR(Math.abs(item.remaining), { hidden })}`
                : item.status === 'peringatan'
                ? `Mendekati batas (${item.percentage}%)`
                : `Aman · Sisa ${formatIDR(item.remaining, { hidden })}`;

            return (
              <div
                key={item.budget.id}
                className="bg-surface border border-border rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">{item.categoryName}</h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Ambang peringatan {item.budget.warningThreshold}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        openModal(
                          item.budget.categoryId,
                          item.budget.limitAmount,
                          item.budget.warningThreshold,
                        )
                      }
                      className="min-h-[40px] px-2.5 rounded-lg text-xs font-medium text-primary hover:bg-primary-soft"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBudget(item.budget.id)}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-text-secondary hover:text-expense hover:bg-expense-soft"
                      aria-label={`Hapus anggaran ${item.categoryName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2 font-mono tabular-nums text-sm">
                  <span className="font-semibold text-text-primary">
                    {formatIDR(item.spent, { hidden })}
                  </span>
                  <span className="text-xs text-text-secondary">
                    dari {formatIDR(item.budget.limitAmount, { hidden })}
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className={`fill-grow h-full rounded-full transition-all duration-200 ${
                      item.status === 'melebihi'
                        ? 'bg-expense'
                        : item.status === 'peringatan'
                        ? 'bg-warning'
                        : 'bg-income'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
                  {statusIcon}
                  <span>{statusText}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        labelledBy="budget-form-title"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 id="budget-form-title" className="text-lg font-semibold text-text-primary">
                Atur Anggaran
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">{formatMonthKeyID(monthKey)}</p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-text-secondary hover:bg-surface-muted"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Kategori Pengeluaran *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-border text-sm bg-surface"
                required
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Batas Anggaran Bulanan (IDR) *
              </label>
              <input
                type="number"
                min={1}
                value={limitStr}
                onChange={(e) => setLimitStr(e.target.value)}
                placeholder="Contoh: 1500000"
                data-autofocus
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-border font-mono tabular-nums text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Ambang Peringatan ({threshold}%)
              </label>
              <input
                type="range"
                min={50}
                max={95}
                step={5}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-border text-sm font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium"
              >
                Simpan Anggaran
              </button>
            </div>
          </form>
        </div>
      </AppModal>
    </div>
  );
}
