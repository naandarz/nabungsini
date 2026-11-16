import { useEffect, useRef, type RefObject } from 'react';

interface UseDialogA11yOptions {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Tracks the stacking order so only the top-most dialog reacts to Escape. */
const openDialogStack: symbol[] = [];

/**
 * Shared dialog behaviour: Escape to close, body scroll lock, initial focus,
 * focus restore on close, and a simple focus trap.
 *
 * Attach the returned ref to the element carrying `role="dialog"` (give it
 * `tabIndex={-1}` so it can receive focus when no `[data-autofocus]` target exists).
 */
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>({
  open,
  onClose,
}: UseDialogA11yOptions): RefObject<T | null> {
  const dialogRef = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const token = Symbol('dialog');
    openDialogStack.push(token);

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }

    const initialFocus =
      dialog?.querySelector<HTMLElement>('[data-autofocus]') ?? dialog ?? null;
    initialFocus?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (openDialogStack[openDialogStack.length - 1] !== token) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          element.tabIndex !== -1 &&
          (element.offsetWidth > 0 ||
            element.offsetHeight > 0 ||
            element === document.activeElement),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey) {
        if (current === first || current === dialog) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      const index = openDialogStack.indexOf(token);
      if (index >= 0) openDialogStack.splice(index, 1);

      // Only unlock the page once every stacked dialog has closed.
      if (openDialogStack.length === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      }

      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open]);

  return dialogRef;
}
