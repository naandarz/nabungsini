import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Camera,
  FileText,
  Paperclip,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import {
  deleteAttachmentById,
  getAttachmentsByIds,
  prepareAndSaveAttachment,
  StoredAttachment,
} from '../../utils/attachmentStorage';
import { formatIDR, generateFinoraTxId, toLocalDateTimeInput } from '../../utils/formatters';
import { useDialogA11y } from '../../hooks/useDialogA11y';

interface TransactionFormSheetProps {
  open: boolean;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onClose: () => void;
  onOpenAccounts?: () => void;
}

export function TransactionFormSheet({
  open,
  initialType = 'expense',
  editingTransaction = null,
  onClose,
  onOpenAccounts,
}: TransactionFormSheetProps) {
  const { state, activeAccounts, saveTransaction, showToast } = useFinance();

  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amountInput, setAmountInput] = useState('');
  const [accountId, setAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(toLocalDateTimeInput());
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [attachments, setAttachments] = useState<StoredAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [tempTxId] = useState(() => generateFinoraTxId());

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    if (editingTransaction) {
      const editType =
        editingTransaction.type === 'income' || editingTransaction.type === 'transfer'
          ? editingTransaction.type
          : 'expense';
      setTxType(editType);
      setAmountInput(String(editingTransaction.amount));
      setAccountId(editingTransaction.accountId);
      setDestinationAccountId(editingTransaction.destinationAccountId || '');
      setCategoryId(editingTransaction.categoryId || '');
      setDate(editingTransaction.date.slice(0, 16));
      setDescription(editingTransaction.description);
      setNote(editingTransaction.note || '');
      getAttachmentsByIds(editingTransaction.attachmentIds).then(setAttachments);
    } else {
      const safeInitType =
        initialType === 'income' || initialType === 'transfer' ? initialType : 'expense';
      setTxType(safeInitType);
      setAmountInput('');
      setAccountId(activeAccounts[0]?.id || '');
      setDestinationAccountId(activeAccounts[1]?.id || '');
      setCategoryId('');
      setDate(toLocalDateTimeInput());
      setDescription('');
      setNote('');
      setAttachments([]);
    }
  }, [open, editingTransaction, initialType, activeAccounts]);

  const filteredCategories = useMemo(() => {
    if (txType === 'transfer') return [];
    return state.categories.filter((c) => c.type === txType);
  }, [state.categories, txType]);

  useEffect(() => {
    if (txType !== 'transfer' && filteredCategories.length > 0) {
      const exists = filteredCategories.some((c) => c.id === categoryId);
      if (!exists) {
        setCategoryId(filteredCategories[0].id);
      }
    }
  }, [txType, filteredCategories, categoryId]);

  const parsedAmount = useMemo(() => {
    const digits = amountInput.replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  }, [amountInput]);

  const sourceAccount = useMemo(
    () => activeAccounts.find((a) => a.id === accountId),
    [activeAccounts, accountId],
  );

  // Calculate projected balance after this transaction
  const projectedBalance = useMemo(() => {
    if (!sourceAccount || parsedAmount <= 0) return null;
    let base = sourceAccount.currentBalance;
    if (editingTransaction && editingTransaction.accountId === sourceAccount.id) {
      if (editingTransaction.type === 'expense' || editingTransaction.type === 'transfer') {
        base += editingTransaction.amount;
      } else if (editingTransaction.type === 'income') {
        base -= editingTransaction.amount;
      }
    }
    if (txType === 'expense' || txType === 'transfer') {
      return base - parsedAmount;
    }
    if (txType === 'income') {
      return base + parsedAmount;
    }
    return base;
  }, [sourceAccount, parsedAmount, txType, editingTransaction]);

  const willBeNegative = projectedBalance !== null && projectedBalance < 0;

  const dialogRef = useDialogA11y<HTMLDivElement>({ open, onClose });

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (attachments.length + files.length > 3) {
      setFormError('Maksimal 3 file bukti per transaksi.');
      return;
    }
    setUploading(true);
    setFormError(null);
    try {
      const targetId = editingTransaction?.id || tempTxId;
      const saved: StoredAttachment[] = [];
      for (const file of files) {
        const rec = await prepareAndSaveAttachment(file, targetId);
        saved.push(rec);
      }
      setAttachments((prev) => [...prev, ...saved]);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mengunggah bukti transaksi.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = async (attId: string) => {
    await deleteAttachmentById(attId);
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (activeAccounts.length === 0) {
      setFormError('Buat minimal satu akun keuangan terlebih dahulu.');
      return;
    }
    if (parsedAmount <= 0) {
      setFormError('Nominal harus lebih besar dari Rp0.');
      return;
    }
    if (!accountId) {
      setFormError('Pilih akun terlebih dahulu.');
      return;
    }
    if (txType === 'transfer') {
      if (!destinationAccountId) {
        setFormError('Pilih akun tujuan transfer.');
        return;
      }
      if (accountId === destinationAccountId) {
        setFormError('Akun sumber dan akun tujuan tidak boleh sama.');
        return;
      }
    } else if (!categoryId) {
      setFormError('Pilih kategori transaksi.');
      return;
    }
    if (!description.trim()) {
      setFormError('Masukkan deskripsi singkat transaksi.');
      return;
    }

    try {
      saveTransaction({
        id: editingTransaction?.id,
        type: txType,
        amount: parsedAmount,
        date: date || toLocalDateTimeInput(),
        accountId,
        destinationAccountId: txType === 'transfer' ? destinationAccountId : undefined,
        categoryId: txType === 'transfer' ? undefined : categoryId,
        description: description.trim(),
        note: note.trim(),
        attachmentIds: attachments.map((a) => a.id),
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan transaksi.';
      setFormError(msg);
      showToast('error', msg);
    }
  };

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#202238]/45 backdrop-blur-[2px] p-0 md:p-4 focus:outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-form-title"
    >
      <div className="modal-panel w-full md:max-w-xl bg-white border border-[#E8E9F1] rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col">
        {/* Grab handle on mobile */}
        <div className="md:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#E8E9F1]" />
        </div>

        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E8E9F1]">
          <div>
            <h2 id="tx-form-title" className="text-lg font-semibold text-[#202238]">
              {editingTransaction ? 'Ubah Transaksi' : 'Catat Transaksi Baru'}
            </h2>
            {editingTransaction && (
              <p className="text-xs font-mono text-[#74778B] mt-0.5">
                ID: {editingTransaction.id}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#74778B] hover:bg-[#F6F7FB] hover:text-[#202238] transition-colors"
            aria-label="Tutup form transaksi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeAccounts.length === 0 ? (
          <div className="p-6 text-center space-y-4">
            <p className="text-sm text-[#74778B]">
              Anda belum memiliki akun keuangan aktif (mis. Rekening Bank, E-Wallet, atau Tunai).
              Buat akun pertama Anda sebelum mencatat transaksi.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E8E9F1] text-sm font-medium text-[#202238]"
              >
                Tutup
              </button>
              {onOpenAccounts && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAccounts();
                  }}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6655D9] text-white text-sm font-medium hover:bg-[#4938B5]"
                >
                  Buat Akun Pertama
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
            {/* Segmented Type Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F6F7FB] rounded-xl border border-[#E8E9F1]">
              <button
                type="button"
                onClick={() => setTxType('expense')}
                className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  txType === 'expense'
                    ? 'bg-white text-[#E65378] shadow-sm'
                    : 'text-[#74778B] hover:text-[#202238]'
                }`}
              >
                <TrendingDown className="w-4 h-4 shrink-0" />
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setTxType('income')}
                className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  txType === 'income'
                    ? 'bg-white text-[#16A779] shadow-sm'
                    : 'text-[#74778B] hover:text-[#202238]'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setTxType('transfer')}
                className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  txType === 'transfer'
                    ? 'bg-white text-[#3989D8] shadow-sm'
                    : 'text-[#74778B] hover:text-[#202238]'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 shrink-0" />
                Transfer
              </button>
            </div>

            {txType === 'transfer' && (
              <p className="text-xs text-[#74778B] bg-[#F6F7FB] px-3 py-2 rounded-xl border border-[#E8E9F1]">
                Transfer internal memindahkan saldo antar-akun Anda sendiri dan tidak dihitung
                sebagai pemasukan maupun pengeluaran.
              </p>
            )}

            {/* Amount */}
            <div>
              <label htmlFor="tx-amount" className="block text-xs font-medium text-[#74778B] mb-1.5">
                Nominal (IDR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-semibold text-[#74778B]">
                  Rp
                </span>
                <input
                  id="tx-amount"
                  type="text"
                  inputMode="numeric"
                  data-autofocus
                  value={parsedAmount > 0 ? new Intl.NumberFormat('id-ID').format(parsedAmount) : ''}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0"
                  className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E9F1] bg-white font-mono tabular-nums text-lg font-semibold text-[#202238] focus:outline-none focus:border-[#6655D9] focus:ring-2 focus:ring-[#6655D9]/15"
                  required
                />
              </div>
            </div>

            {/* Accounts */}
            <div className={`grid gap-3 ${txType === 'transfer' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label htmlFor="tx-account" className="block text-xs font-medium text-[#74778B] mb-1.5">
                  {txType === 'transfer' ? 'Dari Akun *' : 'Akun *'}
                </label>
                <select
                  id="tx-account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#E8E9F1] bg-white text-sm text-[#202238] focus:outline-none focus:border-[#6655D9]"
                  required
                >
                  {activeAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatIDR(acc.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              {txType === 'transfer' && (
                <div>
                  <label htmlFor="tx-dest-account" className="block text-xs font-medium text-[#74778B] mb-1.5">
                    Ke Akun Tujuan *
                  </label>
                  <select
                    id="tx-dest-account"
                    value={destinationAccountId}
                    onChange={(e) => setDestinationAccountId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#E8E9F1] bg-white text-sm text-[#202238] focus:outline-none focus:border-[#6655D9]"
                    required
                  >
                    <option value="">Pilih akun tujuan</option>
                    {activeAccounts
                      .filter((a) => a.id !== accountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatIDR(acc.currentBalance)})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Negative Balance Explicit Warning */}
            {willBeNegative && sourceAccount && (
              <div
                role="alert"
                className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#FFF8EB] border border-[#E5A13A]/40 text-xs text-[#8A5A10]"
              >
                <AlertTriangle className="w-4 h-4 text-[#E5A13A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Peringatan Saldo Negatif:</span> Saldo{' '}
                  <strong>{sourceAccount.name}</strong> akan menjadi{' '}
                  <span className="font-mono font-semibold tabular-nums">
                    {formatIDR(projectedBalance!)}
                  </span>{' '}
                  setelah transaksi ini disimpan.
                </div>
              </div>
            )}

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {txType !== 'transfer' && (
                <div>
                  <label htmlFor="tx-category" className="block text-xs font-medium text-[#74778B] mb-1.5">
                    Kategori *
                  </label>
                  <select
                    id="tx-category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#E8E9F1] bg-white text-sm text-[#202238] focus:outline-none focus:border-[#6655D9]"
                    required
                  >
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={txType === 'transfer' ? 'sm:col-span-2' : ''}>
                <label htmlFor="tx-date" className="block text-xs font-medium text-[#74778B] mb-1.5">
                  Tanggal & Waktu *
                </label>
                <input
                  id="tx-date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#E8E9F1] bg-white text-sm text-[#202238] focus:outline-none focus:border-[#6655D9]"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="tx-desc" className="block text-xs font-medium text-[#74778B] mb-1.5">
                Deskripsi / Nama Transaksi *
              </label>
              <input
                id="tx-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  txType === 'transfer'
                    ? 'Contoh: Top up e-wallet bulanan'
                    : txType === 'income'
                    ? 'Contoh: Gaji bulanan atau pembayaran klien'
                    : 'Contoh: Makan siang, belanja dapur, listrik'
                }
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#E8E9F1] bg-white text-sm text-[#202238] focus:outline-none focus:border-[#6655D9]"
                required
              />
            </div>

            {/* Note */}
            <div>
              <label htmlFor="tx-note" className="block text-xs font-medium text-[#74778B] mb-1.5">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                id="tx-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Detail merchant, nomor referensi, atau keterangan tambahan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E9F1] bg-white text-sm text-[#202238] focus:outline-none focus:border-[#6655D9]"
              />
            </div>

            {/* Attachment Uploader */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[#74778B]">
                  Bukti Transaksi (JPG, PNG, WEBP, PDF · Maks 5 MB)
                </span>
                <span className="text-xs text-[#74778B]">{attachments.length}/3</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="min-h-[44px] px-3.5 py-2 rounded-xl border border-dashed border-[#6655D9]/50 bg-[#F0EDFF]/50 hover:bg-[#F0EDFF] text-[#4938B5] text-xs font-medium inline-flex items-center gap-2 cursor-pointer transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <span>{uploading ? 'Mengunggah...' : 'Pilih File / Struk'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    multiple
                    disabled={uploading || attachments.length >= 3}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <label className="sm:hidden min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E8E9F1] bg-[#F6F7FB] text-[#202238] text-xs font-medium inline-flex items-center gap-2 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <span>Kamera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={uploading || attachments.length >= 3}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl border border-[#E8E9F1] bg-[#F6F7FB]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {att.mimeType.startsWith('image/') ? (
                          <img
                            src={att.dataUrl}
                            alt={att.fileName}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E8E9F1]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white border border-[#E8E9F1] flex items-center justify-center text-[#6655D9] shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#202238] truncate">
                            {att.fileName}
                          </p>
                          <p className="text-[11px] text-[#74778B]">
                            {Math.round(att.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-[#74778B] hover:text-[#E65378] hover:bg-white transition-colors"
                        aria-label={`Hapus lampiran ${att.fileName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formError && (
              <div
                role="alert"
                className="px-3.5 py-2.5 rounded-xl bg-[#FFF0F3] border border-[#E65378]/30 text-xs font-medium text-[#E65378]"
              >
                {formError}
              </div>
            )}

            <div className="pt-2 pb-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E8E9F1] text-sm font-medium text-[#202238] hover:bg-[#F6F7FB] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#6655D9] hover:bg-[#4938B5] disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
