import { FileSpreadsheet, X } from 'lucide-react';
import { useDialogA11y } from '../../hooks/useDialogA11y';
import { NAV_GROUPS, NAV_ITEM_BY_ID, type NavTabId } from '../../types/navigation';

interface NavDrawerProps {
  open: boolean;
  activeTab: NavTabId;
  displayName: string;
  onClose: () => void;
  onNavigate: (tab: NavTabId) => void;
  onOpenCsvImport: () => void;
}

export function NavDrawer({
  open,
  activeTab,
  displayName,
  onClose,
  onNavigate,
  onOpenCsvImport,
}: NavDrawerProps) {
  const panelRef = useDialogA11y<HTMLDivElement>({ open, onClose });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[#202238]/45 backdrop-blur-[1px] md:items-stretch"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        onClick={(event) => event.stopPropagation()}
        className="nav-drawer-panel flex h-[85dvh] w-full flex-col rounded-t-3xl border border-[#E8E9F1] bg-white shadow-2xl focus:outline-none md:h-full md:w-80 md:rounded-none"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-[#E8E9F1] md:hidden" />

        <div className="flex items-center justify-between border-b border-[#E8E9F1] px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6655D9] text-base font-bold text-white">
              F
            </span>
            <span className="min-w-0">
              <span className="block text-base font-bold leading-tight text-[#202238]">
                Finora
              </span>
              <span className="block truncate text-[11px] text-[#74778B]">{displayName}</span>
            </span>
          </div>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#74778B] transition-colors hover:bg-[#F6F7FB] hover:text-[#202238]"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Semua menu">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B8EA3]">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((tab) => {
                  const item = NAV_ITEM_BY_ID[tab];
                  const Icon = item.icon;
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => onNavigate(tab)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#F0EDFF] text-[#4938B5]'
                          : 'text-[#202238] hover:bg-[#F6F7FB]'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${
                          isActive ? 'text-[#6655D9]' : 'text-[#74778B]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-1 border-t border-[#E8E9F1] pt-2">
            {(() => {
              const item = NAV_ITEM_BY_ID.settings;
              const Icon = item.icon;
              const isActive = activeTab === 'settings';
              return (
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F0EDFF] text-[#4938B5]'
                      : 'text-[#202238] hover:bg-[#F6F7FB]'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-[#6655D9]' : 'text-[#74778B]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })()}
          </div>
        </nav>

        <div className="border-t border-[#E8E9F1] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onOpenCsvImport}
            className="flex min-h-[48px] w-full items-center gap-3 rounded-xl bg-[#F6F7FB] px-3.5 py-2.5 text-sm font-medium text-[#202238] transition-colors hover:bg-[#F0EDFF]"
          >
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-[#16A779]" />
            <span>Impor Mutasi CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
