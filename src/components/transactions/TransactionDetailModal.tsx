import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Edit3,
  FileText,
  Paperclip,
  Trash2,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types/finance';
import { getAttachmentsByIds, StoredAttachment } from '../../utils/attachmentStorage';
import { formatDateID, formatIDR, getTransactionTypeLabel } from '../../utils/formatters';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useDialogA11y } from '../../hooks/useDialogA11y';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
}

export function TransactionDetailModal({
  transaction,
  onClose,
  onEdit,
}: TransactionDetailModalProps) {
  const { state, accountsWithBalances, deleteTransaction, showToast } = useFinance();
  const [attachments, setAttachments] = useState<StoredAttachment[]>([]);
  const [copiedId, setCopiedId] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<StoredAttachment | null>(null);

  const dialogRef = useDialogA11y<HTMLDivElement>({
    open: transaction !== null,
    onClose,
  });
  const lightboxRef = useDialogA11y<HTMLDivElement>({
    open: previewAttachment !== null,
    onClose: () => setPreviewAttachment(null),
  });

  useEffect(() => {
    if (!transaction) {
      setAttachments([]);
      return;
    }
    getAttachmentsByIds(transaction.attachmentIds).then(setAttachments);
  }, [transaction]);

  if (!transaction) return null;

  const sourceAcc = accountsWithBalances.find((a) => a.id === transaction.accountId);
  const destAcc = transaction.destinationAccountId
    ? accountsWithBalances.find((a) => a.id === transaction.destinationAccountId)
    : undefined;
  const category = transaction.categoryId
    ? state.categories.find((c) => c.id === transaction.categoryId)
    : undefined;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopiedId(true);
      showToast('success', `ID ${transaction.id} disalin ke clipboard.`);
      window.setTimeout(() => setCopiedId(false), 2000);
    } catch {
      showToast('error', 'Tidak dapat menyalin ID secara otomatis.');
    }
  };

  const handleConfirmDelete = async () => {
    await deleteTransaction(transaction.id);
    setConfirmDeleteOpen(false);
    onClose();
  };

  const sourceLabel =
    transaction.source === 'import'
      ? 'Impor CSV'
      : transaction.source === 'system'
      ? 'Penyesuaian Sistem'
      : 'Input Manual';

  const statusLabel =
    transaction.status === 'perlu_ditinjau' ? 'Perlu ditinjau' : 'Tercatat';

  return (
    <>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#202238]/45 backdrop-blur-[2px] p-0 md:p-4 focus:outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-detail-title"
      >
        <div className="modal-panel w-full md:max-w-lg bg-white border border-[#E8E9F1] rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90dvh] flex flex-col">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E8E9F1]">
            <div>
              <h2 id="tx-detail-title" className="text-base font-semibold text-[#202238]">
                Detail Transaksi
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-[#74778B]">{transaction.id}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#6655D9] hover:text-[#4938B5] px-1.5 py-0.5 rounded hover:bg-[#F0EDFF] transition-colors"
                  aria-label="Salin ID transaksi"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId ? 'Tersalin' : 'Salin ID'}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#74778B] hover:bg-[#F6F7FB] hover:text-[#202238]"
              aria-label="Tutup detail transaksi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
            {/* Highlight Nominal */}
            <div className="p-4 rounded-2xl bg-[#F6F7FB] border border-[#E8E9F1]">
              <div className="flex items-center justify-between text-xs text-[#74778B]">
                <span>{getTransactionTypeLabel(transaction.type)}</span>
                <span>{statusLabel}</span>
              </div>
              <p
                className={`mt-1.5 text-2xl sm:text-3xl font-mono font-bold tabular-nums ${
                  transaction.type === 'income'
                    ? 'text-[#16A779]'
                    : transaction.type === 'expense'
                    ? 'text-[#E65378]'
                    : 'text-[#202238]'
                }`}
              >
                {transaction.type === 'adjustment'
                  ? `${transaction.adjustmentDirection === 'decrease' ? '−' : '+'}${formatIDR(
                      transaction.amount,
                    )}`
                  : formatIDR(transaction.amount, { signed: true, type: transaction.type })}
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#202238]">{transaction.description}</p>
            </div>

            {/* Structured Metadata */}
            <dl className="divide-y divide-[#E8E9F1] border border-[#E8E9F1] rounded-2xl px-4 text-sm">
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-[#74778B]">Waktu Transaksi</dt>
                <dd className="font-medium text-[#202238] text-right">
                  {formatDateID(transaction.date, true)}
                </dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-[#74778B]">
                  {transaction.type === 'transfer' ? 'Akun Sumber' : 'Akun'}
                </dt>
                <dd className="font-medium text-[#202238] text-right">
                  {sourceAcc?.name || 'Akun tidak ditemukan'}
                </dd>
              </div>
              {transaction.type === 'transfer' && (
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-[#74778B]">Akun Tujuan</dt>
                  <dd className="font-medium text-[#202238] text-right">
                    {destAcc?.name || 'Akun tidak ditemukan'}
                  </dd>
                </div>
              )}
              {(transaction.type === 'income' || transaction.type === 'expense') && (
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-[#74778B]">Kategori</dt>
                  <dd className="font-medium text-[#202238] text-right">
                    {category?.name || 'Belum dikategorikan'}
                  </dd>
                </div>
              )}
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-[#74778B]">Sumber Pencatatan</dt>
                <dd className="font-medium text-[#202238] text-right">{sourceLabel}</dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-[#74778B]">Dicatat Pada</dt>
                <dd className="text-xs font-mono text-[#74778B] text-right">
                  {formatDateID(transaction.createdAt, true)}
                </dd>
              </div>
              {transaction.note && (
                <div className="py-3 space-y-1">
                  <dt className="text-[#74778B]">Catatan</dt>
                  <dd className="text-[#202238] leading-relaxed">{transaction.note}</dd>
                </div>
              )}
            </dl>

            {/* Attachments Section */}
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#74778B] mb-2">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Bukti Transaksi ({attachments.length})</span>
              </div>
              {attachments.length === 0 ? (
                <p className="text-xs text-[#74778B] bg-[#F6F7FB] border border-[#E8E9F1] rounded-xl px-3.5 py-3">
                  Tidak ada lampiran bukti pada transaksi ini. Anda dapat menambahkannya melalui
                  tombol Ubah.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="border border-[#E8E9F1] rounded-xl p-2.5 bg-[#F6F7FB] flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewAttachment(att)}
                        className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80"
                      >
                        {att.mimeType.startsWith('image/') ? (
                          <img
                            src={att.dataUrl}
                            alt={att.fileName}
                            className="w-11 h-11 rounded-lg object-cover border border-[#E8E9F1] shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-white border border-[#E8E9F1] flex items-center justify-center text-[#6655D9] shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#202238] truncate">
                            {att.fileName}
                          </p>
                          <p className="text-[11px] text-[#6655D9]">Lihat bukti</p>
                        </div>
                      </button>
                      <a
                        href={att.dataUrl}
                        download={att.fileName}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#74778B] hover:bg-white hover:text-[#202238]"
                        aria-label={`Unduh ${att.fileName}`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-[#E8E9F1] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E65378]/30 text-[#E65378] hover:bg-[#FFF0F3] text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
            {transaction.type !== 'adjustment' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6655D9] hover:bg-[#4938B5] text-white text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Ubah Transaksi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attachment Lightbox */}
      {previewAttachment && (
        <div
          ref={lightboxRef}
          tabIndex={-1}
          className="fixed inset-0 z-[60] bg-[#202238]/85 flex flex-col items-center justify-center p-4 focus:outline-none"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau lampiran"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="modal-panel max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E9F1]">
              <p className="text-sm font-medium text-[#202238] truncate">
                {previewAttachment.fileName}
              </p>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                data-autofocus
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#74778B] hover:bg-[#F6F7FB]"
                aria-label="Tutup pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-[#F6F7FB] flex items-center justify-center max-h-[75vh] overflow-auto">
              {previewAttachment.mimeType.startsWith('image/') ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.fileName}
                  className="max-h-[68vh] w-auto rounded-lg object-contain"
                />
              ) : (
                <div className="text-center py-8 space-y-3">
                  <FileText className="w-12 h-12 text-[#6655D9] mx-auto" />
                  <p className="text-sm text-[#202238]">{previewAttachment.fileName}</p>
                  <a
                    href={previewAttachment.dataUrl}
                    download={previewAttachment.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6655D9] text-white text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Unduh Dokumen PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Hapus Transaksi Ini?"
        description={`Transaksi "${transaction.description}" senilai ${formatIDR(
          transaction.amount,
        )} akan dihapus permanen dan saldo akun terkait akan dihitung ulang.`}
        confirmLabel="Ya, Hapus"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
