import React, { useMemo, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Info, Plus, Target, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { GoalPriority, SavingsGoal } from '../types/finance';
import { computeSavingsGoalSummary } from '../utils/financeEngine';
import { formatDateID, formatIDR, toLocalDateInput } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { AppModal } from '../components/ui/AppModal';

export function SavingsView() {
  const { state, createSavingsGoal, deleteSavingsGoal, recordGoalContribution } = useFinance();
  const hidden = state.preferences.hideBalances;

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<GoalPriority>('sedang');

  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);
  const [contribType, setContribType] = useState<'deposit' | 'withdraw'>('deposit');
  const [contribAmountStr, setContribAmountStr] = useState('');
  const [contribDate, setContribDate] = useState(toLocalDateInput());
  const [contribNote, setContribNote] = useState('');

  const summaries = useMemo(
    () => state.savingsGoals.map(computeSavingsGoalSummary),
    [state.savingsGoals],
  );

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseInt(targetAmountStr.replace(/[^\d]/g, ''), 10) || 0;
    if (!name.trim() || targetAmount <= 0) return;
    createSavingsGoal({
      name,
      description,
      targetAmount,
      targetDate: targetDate || undefined,
      priority,
    });
    setName('');
    setDescription('');
    setTargetAmountStr('');
    setTargetDate('');
    setPriority('sedang');
    setCreateOpen(false);
  };

  const handleRecordContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribGoal) return;
    const amt = parseInt(contribAmountStr.replace(/[^\d]/g, ''), 10) || 0;
    if (amt <= 0) return;
    recordGoalContribution(contribGoal.id, contribType, amt, contribDate, contribNote);
    setContribGoal(null);
    setContribAmountStr('');
    setContribNote('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tabungan & Target"
        description="Target adalah alokasi perencanaan dan tidak menggandakan total saldo rekening Anda."
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Buat Target Baru
          </button>
        }
      />

      <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-surface border border-border text-xs text-text-secondary">
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <span>
          Mencatat kontribusi target di halaman ini memperbarui progres tujuan tanpa mengubah saldo
          akun secara ganda. Jika Anda memindahkan uang antar-rekening, catat juga sebagai{' '}
          <strong>Transfer</strong> pada menu Transaksi.
        </span>
      </div>

      {summaries.length === 0 ? (
        <EmptyState
          icon={<Target className="w-6 h-6" />}
          title="Belum ada target tabungan"
          description="Buat target keuangan seperti Dana Darurat, Biaya Pendidikan, atau Laptop Kerja untuk memantau progres dan estimasi pencapaiannya."
          primaryAction={{
            label: 'Buat Target Pertama',
            onClick: () => setCreateOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map((item) => {
            const { goal } = item;
            return (
              <div
                key={goal.id}
                className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">{goal.name}</h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Prioritas {goal.priority} · Status{' '}
                        {goal.status === 'tercapai'
                          ? 'Tercapai'
                          : goal.status === 'ditunda'
                          ? 'Ditunda'
                          : 'Aktif'}
                        {goal.targetDate ? ` · Tenggat ${formatDateID(goal.targetDate)}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-text-secondary hover:text-expense hover:bg-expense-soft"
                      aria-label={`Hapus target ${goal.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-text-secondary leading-relaxed">{goal.description}</p>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-mono font-bold tabular-nums text-income">
                        {formatIDR(item.savedAmount, { hidden })}
                      </span>
                      <span className="text-xs font-mono tabular-nums text-text-secondary">
                        Target {formatIDR(goal.targetAmount, { hidden })} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-income transition-all duration-200"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-text-secondary space-y-1 bg-surface-muted rounded-xl p-3 border border-border">
                    <div className="flex justify-between">
                      <span>Sisa dana dibutuhkan</span>
                      <span className="font-mono font-semibold text-text-primary">
                        {formatIDR(item.remainingAmount, { hidden })}
                      </span>
                    </div>
                    {item.recommendedMonthly !== null && (
                      <div className="flex justify-between">
                        <span>Perkiraan setoran/bulan</span>
                        <span className="font-mono font-medium text-text-primary">
                          {formatIDR(item.recommendedMonthly, { hidden })}
                        </span>
                      </div>
                    )}
                    {item.estimatedCompletionDate && (
                      <div className="flex justify-between">
                        <span>Perkiraan tercapai</span>
                        <span className="font-medium text-text-primary">
                          {item.estimatedCompletionDate === 'Sudah tercapai'
                            ? 'Sudah tercapai'
                            : formatDateID(item.estimatedCompletionDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContribGoal(goal);
                      setContribType('deposit');
                    }}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-income-soft hover:bg-income-soft text-income text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Tambah Kontribusi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setContribGoal(goal);
                      setContribType('withdraw');
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl border border-border hover:bg-surface-muted text-text-primary text-xs font-medium inline-flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpCircle className="w-4 h-4 text-text-secondary" />
                    Tarik
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <AppModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        labelledBy="savings-goal-title"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 id="savings-goal-title" className="text-lg font-semibold text-text-primary">
                Buat Target Tabungan
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Tentukan nominal dan tenggat agar progres bisa dipantau.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-text-secondary hover:bg-surface-muted"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Nama Target *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Dana Darurat, Laptop Kerja"
                data-autofocus
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-border text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Nominal Target (IDR) *
              </label>
              <input
                type="number"
                min={1}
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                placeholder="10000000"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-border font-mono tabular-nums text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Tenggat (Opsional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as GoalPriority)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-border text-sm bg-surface"
                >
                  <option value="tinggi">Tinggi</option>
                  <option value="sedang">Sedang</option>
                  <option value="rendah">Rendah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Deskripsi (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Catatan singkat mengenai target ini"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-border text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-border text-sm font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium"
              >
                Simpan Target
              </button>
            </div>
          </form>
        </div>
      </AppModal>

      {/* Contribution / Withdrawal Modal */}
      <AppModal
        open={contribGoal !== null}
        onClose={() => setContribGoal(null)}
        labelledBy="savings-contrib-title"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 id="savings-contrib-title" className="text-lg font-semibold text-text-primary">
                {contribType === 'deposit' ? 'Tambah Kontribusi' : 'Catat Penarikan'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">{contribGoal?.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setContribGoal(null)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-text-secondary hover:bg-surface-muted"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleRecordContribution} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Nominal (IDR) *
              </label>
              <input
                type="number"
                min={1}
                value={contribAmountStr}
                onChange={(e) => setContribAmountStr(e.target.value)}
                data-autofocus
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-border font-mono tabular-nums text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Tanggal *</label>
              <input
                type="date"
                value={contribDate}
                onChange={(e) => setContribDate(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-border text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={contribNote}
                onChange={(e) => setContribNote(e.target.value)}
                placeholder="Contoh: Alokasi gaji bulan ini"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-border text-sm"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setContribGoal(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-border text-sm font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </AppModal>
    </div>
  );
}
