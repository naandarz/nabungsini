import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useDialogA11y } from '../../hooks/useDialogA11y';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import { SheetHandle } from './SheetHandle';

type ModalWidth = 'sm' | 'md' | 'lg' | 'xl';

const WIDTH_CLASS: Record<ModalWidth, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
};

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
  width?: ModalWidth;
  panelClassName?: string;
}

/**
 * Standard mobile bottom-sheet / desktop dialog shell.
 * Handles Escape, scroll lock, focus restore, focus trapping, and
 * drag-to-dismiss from the grab handle on touch screens.
 */
export function AppModal({
  open,
  onClose,
  labelledBy,
  children,
  width = 'md',
  panelClassName = '',
}: AppModalProps) {
  const dialogRef = useDialogA11y<HTMLDivElement>({ open, onClose });
  const drag = useSheetDrag(onClose);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/45 p-0 backdrop-blur-[2px] focus:outline-none sm:items-center sm:p-4"
    >
      <motion.div
        drag={drag.enabled ? 'y' : false}
        dragListener={false}
        dragControls={drag.controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={drag.onDragEnd}
        className={`modal-panel w-full ${WIDTH_CLASS[width]} max-h-[92dvh] overflow-y-auto rounded-t-3xl border border-border bg-surface shadow-2xl sm:rounded-2xl ${panelClassName}`}
      >
        <SheetHandle onPointerDown={drag.handlePointerDown} />
        {children}
      </motion.div>
    </div>
  );
}
