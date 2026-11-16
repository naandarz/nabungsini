import React, { useState } from 'react';
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Building2,
  Edit3,
  Plus,
  RefreshCw,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { AccountType } from '../types/finance';
import { AccountWithBalance } from '../utils/financeEngine';
import { formatIDR, getAccountTypeLabel } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { AppModal } from '../components/ui/AppModal';

export function AccountsView() {
  const {
    state,
    accountsWithBalances,
    totalBalance,
    addAccount,
    updateAccount,
    toggleArchiveAccount,
    reconcileAccount,
  } = useFinance();

  const hidden = state.preferences.hideBalances;
  const [showArchived, setShowArchived] = useState(false);

  // Add/Edit Account Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<AccountWithBalance | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [institution, setInstitution] = useState('');
  const [openingBalanceStr, setOpeningBalanceStr] = useState('0');
  const [includeInTotal, setIncludeInTotal] = useState(true);

  // Reconcile Modal state
  const [reconcileTarget, setReconcileTarget] = useState<AccountWithBalance | null>(null);
  const [actualBalanceStr, setActualBalanceStr] = useState('');
  const [reconcileReason, setReconcileReason] = useState('');

  const visibleAccounts = accountsWithBalances.filter((a) =>
    showArchived ? a.isArchived : !a.isArchived,
  );

  const openCreateModal = () => {
    setEditingAcc(null);
    setName('');
    setType('bank');
    setInstitution('');
    setOpeningBalanceStr('0');
    setIncludeInTotal(true);
    setFormOpen(true);
  };

  const openEditModal = (acc: AccountWithBalance) => {
    setEditingAcc(acc);
    setName(acc.name);
    setType(acc.type);
    setInstitution(acc.institution);
    setOpeningBalanceStr(String(acc.openingBalance));
    setIncludeInTotal(acc.includeInTotal);
    setFormOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBalance = parseInt(openingBalanceStr.replace(/[^\d-]/g, ''), 10) || 0;
    if (!name.trim()) return;

    if (editingAcc) {
      updateAccount(editingAcc.id, {
        name: name.trim(),
        type,
        institution: institution.trim(),
        openingBalance: cleanBalance,
        includeInTotal,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        institution: institution.trim(),
        openingBalance: cleanBalance,
        includeInTotal,
      });
    }
    setFormOpen(false);
  };

  const openReconcileModal = (acc: AccountWithBalance) => {
    setReconcileTarget(acc);
    setActualBalanceStr(String(acc.currentBalance));
    setReconcileReason('Penyesuaian saldo aktual sesuai mutasi');
  };

  const handleConfirmReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileTarget) return;
    const actual = parseInt(actualBalanceStr.replace(/[^\d-]/g, ''), 10) || 0;
    reconcileAccount(reconcileTarget.id, actual, reconcileReason);
    setReconcileTarget(null);
  };

  const renderIcon = (accType: AccountType) => {
    if (accType === 'bank' || accType === 'savings') return <Building2 className="w-5 h-5" />;
    if (accType === 'ewallet') return <Smartphone className="w-5 h-5" />;
    return <Wallet className="w-5 h-5" />;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Akun & Rekening"
        description={
          <>
            Total saldo terhitung:{' '}
            <strong className="font-mono text-[#202238]">
              {formatIDR(totalBalance, { hidden })}
            </strong>{' '}
            · Data tersimpan lokal & aman tanpa kredensial bank.
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowArchived((value) => !value)}
              className="min-h-[44px] whitespace-nowrap rounded-xl border border-[#E8E9F1] bg-white px-3.5 py-2 text-xs font-medium text-[#202238] hover:bg-[#F6F7FB] sm:text-sm"
            >
              {showArchived ? 'Lihat Akun Aktif' : 'Lihat Arsip'}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-[#6655D9] px-4 py-2 text-xs font-medium text-white hover:bg-[#4938B5] sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah Akun
            </button>
          </>
        }
      />

      {visibleAccounts.length === 0 ? (
        <EmptyState
          icon={<Wallet className="w-6 h-6" />}
          title={showArchived ? 'Tidak ada akun yang diarsipkan' : 'Belum ada akun keuangan'}
          description={
            showArchived
              ? 'Akun yang Anda arsipkan akan muncul di sini tanpa menghapus riwayat transaksinya.'
              : 'Tambahkan rekening bank, e-wallet (GoPay, OVO, DANA), atau dompet tunai Anda.'
          }
          primaryAction={
            showArchived
              ? { label: 'Kembali ke Akun Aktif', onClick: () => setShowArchived(false) }
              : { label: 'Tambah Akun Pertama', onClick: openCreateModal }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleAccounts.map((acc) => {
            const isNegative = acc.currentBalance < 0;
            return (
              <div
                key={acc.id}
                className="bg-white border border-[#E8E9F1] rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] text-[#6655D9] flex items-center justify-center shrink-0">
                        {renderIcon(acc.type)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-[#202238] truncate">
                          {acc.name}
                        </h2>
                        <p className="text-xs text-[#74778B] truncate">
                          {getAccountTypeLabel(acc.type)}
                          {acc.institution ? ` · ${acc.institution}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditModal(acc)}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#74778B] hover:bg-[#F6F7FB] hover:text-[#202238]"
                      aria-label={`Ubah akun ${acc.name}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-[#74778B]">Saldo Saat Ini</p>
                    <p
                      className={`mt-1 text-2xl font-mono font-bold tabular-nums ${
                        isNegative ? 'text-[#E65378]' : 'text-[#202238]'
                      }`}
                    >
                      {formatIDR(acc.currentBalance, { hidden })}
                    </p>
                    {isNegative && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#8A5A10] bg-[#FFF8EB] px-2.5 py-1 rounded-lg border border-[#E5A13A]/35">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#E5A13A] shrink-0" />
                        Saldo Negatif — Periksa mutasi atau rekonsiliasi
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E9F1] flex items-center justify-between gap-2 text-xs text-[#74778B]">
                  <span>
                    {acc.transactionCount} transaksi ·{' '}
                    {acc.includeInTotal ? 'Masuk total saldo' : 'Dikecualikan'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!acc.isArchived && (
                      <button
                        type="button"
                        onClick={() => openReconcileModal(acc)}
                        className="min-h-[40px] px-2.5 py-1 rounded-lg border border-[#E8E9F1] text-[#202238] hover:bg-[#F6F7FB] font-medium inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Rekonsiliasi
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleArchiveAccount(acc.id)}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-[#E8E9F1] text-[#74778B] hover:text-[#202238] hover:bg-[#F6F7FB]"
                      title={acc.isArchived ? 'Aktifkan kembali' : 'Arsipkan akun'}
                      aria-label={acc.isArchived ? 'Aktifkan kembali' : 'Arsipkan akun'}
                    >
                      {acc.isArchived ? (
                        <ArchiveRestore className="w-4 h-4" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Account Modal */}
      <AppModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        labelledBy="account-form-title"
      >
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="account-form-title" className="text-lg font-semibold text-[#202238]">
                {editingAcc ? 'Ubah Akun Keuangan' : 'Tambah Akun Manual'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#74778B] hover:bg-[#F6F7FB]"
                aria-label="Tutup modal akun"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#74778B] mb-1">
                  Nama Akun *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: BCA Utama, GoPay, Dompet Tunai"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8E9F1] text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#74778B] mb-1">
                    Jenis Akun *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-sm bg-white"
                  >
                    <option value="bank">Rekening Bank</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="cash">Uang Tunai</option>
                    <option value="savings">Tabungan</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#74778B] mb-1">
                    Institusi / Penyedia
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Contoh: BCA, Mandiri, DANA"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8E9F1] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#74778B] mb-1">
                  Saldo Awal (IDR)
                </label>
                <input
                  type="number"
                  value={openingBalanceStr}
                  onChange={(e) => setOpeningBalanceStr(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8E9F1] font-mono tabular-nums text-sm"
                />
              </div>

              <label className="flex items-center gap-2.5 text-sm text-[#202238] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInTotal}
                  onChange={(e) => setIncludeInTotal(e.target.checked)}
                  className="w-4 h-4 accent-[#6655D9]"
                />
                Sertakan dalam perhitungan Total Saldo Dashboard
              </label>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E8E9F1] text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6655D9] hover:bg-[#4938B5] text-white text-sm font-medium"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
        </div>
      </AppModal>

      {/* Reconcile Modal */}
      <AppModal
        open={reconcileTarget !== null}
        onClose={() => setReconcileTarget(null)}
        labelledBy="account-reconcile-title"
      >
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="account-reconcile-title" className="text-lg font-semibold text-[#202238]">
                Rekonsiliasi: {reconcileTarget?.name}
              </h2>
              <button
                type="button"
                onClick={() => setReconcileTarget(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#74778B] hover:bg-[#F6F7FB]"
                aria-label="Tutup rekonsiliasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReconcile} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F6F7FB] border border-[#E8E9F1] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#74778B]">Saldo Tercatat di Finora</span>
                  <span className="font-mono font-semibold text-[#202238]">
                    {formatIDR(reconcileTarget?.currentBalance ?? 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#74778B] mb-1">
                  Saldo Aktual Sebenarnya (IDR)
                </label>
                <input
                  type="number"
                  value={actualBalanceStr}
                  onChange={(e) => setActualBalanceStr(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8E9F1] font-mono tabular-nums text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#74778B] mb-1">
                  Alasan Penyesuaian *
                </label>
                <input
                  type="text"
                  value={reconcileReason}
                  onChange={(e) => setReconcileReason(e.target.value)}
                  placeholder="Contoh: Selisih biaya admin bank atau uang tunai tercecer"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8E9F1] text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReconcileTarget(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E8E9F1] text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6655D9] hover:bg-[#4938B5] text-white text-sm font-medium"
                >
                  Catat Penyesuaian
                </button>
              </div>
            </form>
        </div>
      </AppModal>
    </div>
  );
}
