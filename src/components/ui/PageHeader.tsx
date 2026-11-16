import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}

/**
 * Consistent page heading used by every view so the top bar title,
 * page title, and primary actions always line up the same way.
 */
export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#74778B]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-bold tracking-tight text-[#202238] sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#74778B] sm:text-sm">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{actions}</div>
      )}
    </div>
  );
}
