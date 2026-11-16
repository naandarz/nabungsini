import { AlertTriangle, X } from 'lucide-react';
import { useDialogA11y } from '../../hooks/useDialogA11y';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useDialogA11y<HTMLDivElement>({ open, onClose: onCancel });

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-overlay/40 backdrop-blur-[2px] p-0 sm:p-4 focus:outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="modal-panel w-full sm:max-w-md bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-6 shadow-xl max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                destructive ? 'bg-expense-soft text-expense' : 'bg-primary-soft text-primary'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirm-dialog-title" className="text-base font-semibold text-text-primary">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] min-w-[40px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            data-autofocus
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-surface-muted transition-colors whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors whitespace-nowrap ${
              destructive
                ? 'bg-expense hover:bg-expense-strong'
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
