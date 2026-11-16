import type { ComponentType } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Bot,
  Home,
  PieChart,
  Settings,
  Target,
  Wallet,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'budgets'
  | 'savings'
  | 'analytics'
  | 'ai'
  | 'settings';

export type NavIcon = ComponentType<{ className?: string }>;

export interface NavItem {
  id: NavTabId;
  label: string;
  icon: NavIcon;
  /** Path segment used for the hash route (without the leading `#/`). */
  route: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Beranda',
    icon: Home,
    route: 'beranda',
    description: 'Ringkasan saldo, arus kas, dan aktivitas terbaru',
  },
  {
    id: 'transactions',
    label: 'Transaksi',
    icon: ArrowLeftRight,
    route: 'transaksi',
    description: 'Cari, filter, dan catat seluruh transaksi',
  },
  {
    id: 'accounts',
    label: 'Akun',
    icon: Wallet,
    route: 'akun',
    description: 'Kelola rekening bank, e-wallet, dan uang tunai',
  },
  {
    id: 'budgets',
    label: 'Anggaran',
    icon: PieChart,
    route: 'anggaran',
    description: 'Tetapkan batas pengeluaran per kategori',
  },
  {
    id: 'savings',
    label: 'Tabungan',
    icon: Target,
    route: 'tabungan',
    description: 'Pantau progres target dan alokasi tabungan',
  },
  {
    id: 'analytics',
    label: 'Analisis',
    icon: BarChart3,
    route: 'analisis',
    description: 'Bandingkan arus kas dan pola pengeluaran',
  },
  {
    id: 'ai',
    label: 'Asisten AI',
    icon: Bot,
    route: 'asisten',
    description: 'Tanyakan kondisi keuangan pada asisten terverifikasi',
  },
  {
    id: 'settings',
    label: 'Pengaturan',
    icon: Settings,
    route: 'pengaturan',
    description: 'Preferensi, kategori, privasi AI, dan cadangan data',
  },
];

export const NAV_ITEM_BY_ID = NAV_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<NavTabId, NavItem>,
);

/** Sidebar/drawer grouping. Settings deliberately lives in the footer/profile area. */
export const NAV_GROUPS: { label: string; items: NavTabId[] }[] = [
  { label: 'Keuangan', items: ['dashboard', 'transactions', 'accounts', 'budgets', 'savings'] },
  { label: 'Wawasan', items: ['analytics', 'ai'] },
];

/** Tabs visible directly in the mobile bottom bar (plus the central add action). */
export const MOBILE_PRIMARY_TABS: NavTabId[] = ['dashboard', 'transactions', 'analytics'];

const ROUTE_ALIASES: Record<string, NavTabId> = {
  '': 'dashboard',
  beranda: 'dashboard',
  dashboard: 'dashboard',
  home: 'dashboard',
  transaksi: 'transactions',
  transactions: 'transactions',
  akun: 'accounts',
  accounts: 'accounts',
  rekening: 'accounts',
  anggaran: 'budgets',
  budgets: 'budgets',
  tabungan: 'savings',
  savings: 'savings',
  target: 'savings',
  analisis: 'analytics',
  analytics: 'analytics',
  laporan: 'analytics',
  asisten: 'ai',
  'asisten-ai': 'ai',
  ai: 'ai',
  pengaturan: 'settings',
  settings: 'settings',
};

/** Resolve any hash (e.g. `#/transaksi`, `#transactions`) to a known tab. */
export function tabFromHash(hash: string): NavTabId {
  const cleaned = hash
    .replace(/^#/, '')
    .replace(/^\//, '')
    .split(/[?&]/)[0]
    .replace(/\/+$/, '')
    .toLowerCase();

  return ROUTE_ALIASES[cleaned] ?? 'dashboard';
}

/** Canonical hash route for a tab, e.g. `#/transaksi`. */
export function hashForTab(tab: NavTabId): string {
  return `#/${NAV_ITEM_BY_ID[tab].route}`;
}

export function isTabActive(activeTab: NavTabId, tab: NavTabId): boolean {
  return activeTab === tab;
}
