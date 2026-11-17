import { ArrowLeftRight, BarChart3, Home, LayoutGrid, Plus, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
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

  const renderTab = (tab: NavTabId, label: string, Icon: LucideIcon, onClick: () => void, isActive: boolean) => (
    <button
      key={tab}
      type="button"
      onClick={onClick}
      className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
        isActive ? 'text-primary' : 'text-text-secondary'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && (
        <motion.span
          layoutId="mobile-nav-pill"
          transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
          className="absolute inset-x-1.5 top-1 h-8 rounded-xl bg-primary-soft"
          aria-hidden="true"
        />
      )}
      <motion.span
        className="relative z-10 flex flex-col items-center gap-0.5"
        animate={{ scale: isActive ? 1 : 0.94 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-medium">{label}</span>
      </motion.span>
    </button>
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Navigasi utama mobile"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-1">
        {renderTab('dashboard', 'Beranda', Home, () => onNavigate('dashboard'), activeTab === 'dashboard')}
        {renderTab(
          'transactions',
          'Transaksi',
          ArrowLeftRight,
          () => onNavigate('transactions'),
          activeTab === 'transactions',
        )}

        <div className="flex items-center justify-center">
          <motion.button
            type="button"
            onClick={() => onOpenNewTransaction('expense')}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md hover:bg-primary-dark"
            aria-label="Catat transaksi baru"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </div>

        {renderTab(
          'analytics',
          'Analisis',
          BarChart3,
          () => onNavigate('analytics'),
          activeTab === 'analytics',
        )}

        <button
          type="button"
          onClick={onOpenMenu}
          className={`relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
            menuActive ? 'text-primary' : 'text-text-secondary'
          }`}
          aria-current={menuActive ? 'page' : undefined}
          aria-label="Buka semua menu"
        >
          {menuActive && (
            <motion.span
              layoutId="mobile-nav-pill"
              transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
              className="absolute inset-x-1.5 top-1 h-8 rounded-xl bg-primary-soft"
              aria-hidden="true"
            />
          )}
          <motion.span
            className="relative z-10 flex flex-col items-center gap-0.5"
            animate={{ scale: menuActive ? 1 : 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </motion.span>
        </button>
      </div>
    </nav>
  );
}
