import { ArrowLeftRight, BarChart3, Home, LayoutGrid, Plus } from 'lucide-react';
import type { TransactionType } from '../../types/finance';
import type { NavTabId } from '../../types/navigation';

interface MobileBottomNavProps {
  activeTab: NavTabId;
  onNavigate: (tab: NavTabId) => void;
  onOpenMenu: () => void;
  onOpenNewTransaction: (type: TransactionType) => void;
}

const SECONDARY_TABS: NavTabId[] = ['accounts', 'budgets', 'savings', 'ai', 'settings'];

export function MobileBottomNav({
  activeTab,
  onNavigate,
  onOpenMenu,
  onOpenNewTransaction,
}: MobileBottomNavProps) {
  const menuActive = SECONDARY_TABS.includes(activeTab);

  const tabClass = (isActive: boolean) =>
    `flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
      isActive ? 'text-[#6655D9]' : 'text-[#74778B]'
    }`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E9F1] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Navigasi utama mobile"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-1">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={tabClass(activeTab === 'dashboard')}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('transactions')}
          className={tabClass(activeTab === 'transactions')}
          aria-current={activeTab === 'transactions' ? 'page' : undefined}
        >
          <ArrowLeftRight className="h-5 w-5" />
          <span className="text-[10px] font-medium">Transaksi</span>
        </button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => onOpenNewTransaction('expense')}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6655D9] text-white shadow-md transition-transform hover:bg-[#4938B5] active:scale-95"
            aria-label="Catat transaksi baru"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className={tabClass(activeTab === 'analytics')}
          aria-current={activeTab === 'analytics' ? 'page' : undefined}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Analisis</span>
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          className={tabClass(menuActive)}
          aria-current={menuActive ? 'page' : undefined}
          aria-label="Buka semua menu"
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
