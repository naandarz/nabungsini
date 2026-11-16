import { Menu, Moon, Plus, Sun } from 'lucide-react';
import type { TransactionType } from '../../types/finance';
import { NAV_ITEM_BY_ID, type NavTabId } from '../../types/navigation';
import { useTheme } from '../../hooks/useTheme';

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
  const { resolved, toggle: toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:px-6 md:h-16">
      <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white md:hidden"
          aria-label="Finora — kembali ke Beranda"
        >
          F
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          className="hidden min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-border text-text-primary transition-colors hover:bg-surface-muted md:flex lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="mb-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral md:block">
            Finora
          </p>
          <p className="truncate text-sm font-semibold text-text-primary md:text-[15px]">
            {item.label}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="press flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          aria-label={resolved === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
          aria-pressed={resolved === 'dark'}
          title={resolved === 'dark' ? 'Tema terang' : 'Tema gelap'}
        >
          {resolved === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={() => onOpenNewTransaction('expense')}
          className="hidden min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark md:inline-flex"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </header>
  );
}
