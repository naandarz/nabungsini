interface SheetHandleProps {
  onPointerDown: (event: React.PointerEvent) => void;
  label?: string;
}

/** Grab bar that tells touch users the sheet can be pulled down to close. */
export function SheetHandle({ onPointerDown, label = 'Tarik ke bawah untuk menutup' }: SheetHandleProps) {
  return (
    <div
      role="presentation"
      aria-label={label}
      onPointerDown={onPointerDown}
      className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-2.5 active:cursor-grabbing md:hidden"
    >
      <span className="h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
    </div>
  );
}
