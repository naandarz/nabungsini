import { Menu, Plus } from 'lucide-react';
import type { TransactionType } from '../../types/finance';
import { NAV_ITEM_BY_ID, type NavTabId } from '../../types/navigation';

interface AppTopBarProps {
  activeTab: NavTabId;
  onNavigate: (tab: NavTabId) => void;
  onOpenMenu: () => void;
  onOpenNewTransaction: (type: TransactionType) => void;
}

export function AppTopBar({
  activeTab,
  onNavigate,
  onOpenMenu,
  onOpenNewTransaction,
}: AppTopBarProps) {
  const item = NAV_ITEM_BY_ID[activeTab];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[#E8E9F1] bg-white/95 px-4 backdrop-blur-md sm:px-6 md:h-16">
      <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#6655D9] text-sm font-bold text-white md:hidden"
          aria-label="Finora — kembali ke Beranda"
        >
          F
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          className="hidden min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-[#E8E9F1] text-[#202238] transition-colors hover:bg-[#F6F7FB] md:flex lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="mb-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B8EA3] md:block">
            Finora
          </p>
          <p className="truncate text-sm font-semibold text-[#202238] md:text-[15px]">
            {item.label}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenNewTransaction('expense')}
          className="hidden min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#6655D9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4938B5] md:inline-flex"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </header>
  );
}
