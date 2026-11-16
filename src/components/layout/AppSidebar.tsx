import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { NAV_GROUPS, NAV_ITEM_BY_ID, type NavTabId } from '../../types/navigation';

interface AppSidebarProps {
  activeTab: NavTabId;
  collapsed: boolean;
  displayName: string;
  onNavigate: (tab: NavTabId) => void;
  onToggleCollapse: () => void;
}

export function AppSidebar({
  activeTab,
  collapsed,
  displayName,
  onNavigate,
  onToggleCollapse,
}: AppSidebarProps) {
  const initials = displayName.slice(0, 2).toUpperCase() || 'FN';
  const settingsActive = activeTab === 'settings';

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#E8E9F1] bg-white transition-[width] duration-150 lg:flex ${
        collapsed ? 'w-[76px]' : 'w-[248px]'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-[#E8E9F1] px-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex min-w-0 items-center gap-2.5 rounded-lg text-left"
          aria-label="Finora — kembali ke Beranda"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6655D9] text-base font-bold text-white">
            F
          </span>
          {!collapsed && (
            <span className="whitespace-nowrap text-lg font-bold tracking-tight text-[#202238]">
              Finora
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-[#74778B] transition-colors hover:bg-[#F6F7FB] hover:text-[#202238]"
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Navigasi utama">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3 last:mb-0">
            {!collapsed && (
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B8EA3]">
                {group.label}
              </p>
            )}
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
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#F0EDFF] text-[#4938B5]'
                        : 'text-[#74778B] hover:bg-[#F6F7FB] hover:text-[#202238]'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#6655D9]' : ''}`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#E8E9F1] p-3">
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          title={collapsed ? 'Pengaturan' : undefined}
          aria-current={settingsActive ? 'page' : undefined}
          className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
            settingsActive
              ? 'bg-[#F0EDFF]'
              : 'hover:bg-[#F6F7FB]'
          } ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              settingsActive ? 'bg-[#6655D9] text-white' : 'bg-[#F0EDFF] text-[#4938B5]'
            }`}
          >
            {initials}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-[#202238]">
                  {displayName}
                </span>
                <span className="block truncate text-[11px] text-[#74778B]">
                  Pengaturan & data
                </span>
              </span>
              <Settings className="h-4 w-4 shrink-0 text-[#74778B]" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
