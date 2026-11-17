import { useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'motion/react';

interface SwipeRowProps {
  children: ReactNode;
  actionLabel: string;
  actionIcon?: ReactNode;
  onAction: () => void;
  /** Width of the revealed action area in px. */
  actionWidth?: number;
  className?: string;
}

/**
 * Mobile list row: swipe left to reveal a single action button, swipe right
 * (or tap elsewhere) to tuck it away again. Vertical scrolling stays native.
 */
export function SwipeRow({
  children,
  actionLabel,
  actionIcon,
  onAction,
  actionWidth = 92,
  className = '',
}: SwipeRowProps) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const startX = useRef(0);

  const handleDragStart = (_event: unknown, info: PanInfo) => {
    startX.current = info.point.x;
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (reduceMotion) return;
    const shouldOpen = info.offset.x < -actionWidth / 2 || info.velocity.x < -450;
    setOpen(shouldOpen);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-y-0 right-0 flex items-stretch"
        style={{ width: actionWidth }}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={() => {
            setOpen(false);
            onAction();
          }}
          className="press flex w-full flex-col items-center justify-center gap-1 bg-primary-soft text-primary-dark"
          aria-label={actionLabel}
        >
          {actionIcon}
          <span className="text-[11px] font-semibold">{actionLabel}</span>
        </button>
      </div>

      <motion.div
        drag={reduceMotion ? false : 'x'}
        dragDirectionLock
        dragConstraints={{ left: -actionWidth, right: 0 }}
        dragElastic={{ left: 0.06, right: 0.03 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{ x: open ? -actionWidth : 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.7 }}
        className="relative bg-surface"
      >
        {children}
      </motion.div>
    </div>
  );
}
