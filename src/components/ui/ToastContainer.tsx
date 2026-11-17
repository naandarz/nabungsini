import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { ToastItem } from '../../types/finance';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const icon =
            toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-income shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-expense shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-info shrink-0" />
            );

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 480, damping: 34, mass: 0.7 }}
              className="pointer-events-auto flex items-center justify-between gap-3 bg-surface border border-border rounded-xl px-4 py-3 shadow-lg text-sm text-text-primary"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {icon}
                <span className="leading-snug">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary shrink-0"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
