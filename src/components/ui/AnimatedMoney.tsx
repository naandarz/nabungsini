import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { TransactionType } from '../../types/finance';
import { formatIDR } from '../../utils/formatters';

interface AnimatedMoneyProps {
  value: number;
  hidden?: boolean;
  signed?: boolean;
  type?: TransactionType;
  className?: string;
  /** Count-up duration in milliseconds. */
  duration?: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Currency figure that counts up when its value changes, so a refreshed
 * balance reads as movement instead of a silent swap.
 */
export function AnimatedMoney({
  value,
  hidden,
  signed,
  type,
  className = '',
  duration = 520,
}: AnimatedMoneyProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion || !Number.isFinite(value)) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const delta = value - from;

    if (Math.abs(delta) < 0.5) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const next = from + delta * easeOutCubic(progress);
      setDisplay(next);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
        setDisplay(value);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      fromRef.current = value;
    };
  }, [value, duration, reduceMotion]);

  return (
    <span className={className}>
      {hidden
        ? 'Rp•••••••'
        : formatIDR(Math.round(display), { hidden, signed, type })}
    </span>
  );
}
