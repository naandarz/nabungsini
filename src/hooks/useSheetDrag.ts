import { useEffect, useState } from 'react';
import { useDragControls, type PanInfo } from 'motion/react';

const MOBILE_QUERY = '(max-width: 767px)';

function readIsMobile() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

/**
 * Drag-to-dismiss for bottom sheets on touch-sized screens.
 * Only a grab handle starts the drag, so long forms still scroll normally.
 */
export function useSheetDrag(onClose: () => void) {
  const controls = useDragControls();
  const [enabled, setEnabled] = useState(readIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    // A quick flick or a deliberate pull both dismiss the sheet.
    if (info.offset.y > 120 || info.velocity.y > 650) onClose();
  };

  return {
    enabled,
    controls,
    onDragEnd,
    handlePointerDown: (event: React.PointerEvent) => {
      if (!enabled) return;
      controls.start(event);
    },
  };
}
