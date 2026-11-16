import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-text-primary max-w-md">{title}</h3>
      <p className="mt-1.5 text-sm text-text-secondary max-w-md leading-relaxed">{description}</p>
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text-primary text-sm font-medium transition-colors whitespace-nowrap"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
