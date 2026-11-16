import { useRef, useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Transaction, TransactionType } from './types/finance';
import { useAppRoute } from './hooks/useAppRoute';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppTopBar } from './components/layout/AppTopBar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { NavDrawer } from './components/layout/NavDrawer';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { AccountsView } from './views/AccountsView';
import { BudgetsView } from './views/BudgetsView';
import { SavingsView } from './views/SavingsView';
import { AnalyticsView } from './views/AnalyticsView';
import { AiAssistantView } from './views/AiAssistantView';
import { SettingsView } from './views/SettingsView';
import { TransactionFormSheet } from './components/transactions/TransactionFormSheet';
import { TransactionDetailModal } from './components/transactions/TransactionDetailModal';
import { CsvImportModal } from './components/transactions/CsvImportModal';
import { ToastContainer } from './components/ui/ToastContainer';

function FinoraAppShell() {
  const { state, toasts, dismissToast } = useFinance();
  const { activeTab, navigate } = useAppRoute();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [txFormOpen, setTxFormOpen] = useState(false);
  const [txFormInitialType, setTxFormInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const mainRef = useRef<HTMLElement>(null);

  const openNewTransaction = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setTxFormInitialType(type);
    setTxFormOpen(true);
  };

  const openEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxFormInitialType(tx.type);
    setTxFormOpen(true);
  };

  const handleNavigate = (tab: Parameters<typeof navigate>[0]) => {
    navigate(tab);
    setDrawerOpen(false);
  };

  const openCsvImport = () => {
    setDrawerOpen(false);
    setCsvModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <button type="button" className="skip-link" onClick={() => mainRef.current?.focus()}>
        Lewati ke konten utama
      </button>

      <AppSidebar
        activeTab={activeTab}
        collapsed={sidebarCollapsed}
        displayName={state.preferences.displayName}
        onNavigate={handleNavigate}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onOpenMenu={() => setDrawerOpen(true)}
          onOpenNewTransaction={openNewTransaction}
        />

        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] focus:outline-none sm:px-6 sm:py-6 md:pb-8"
        >
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onOpenNewTx={openNewTransaction}
              onOpenCsvImport={openCsvImport}
              onSelectTransaction={setSelectedTransaction}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenNewTx={openNewTransaction}
              onOpenCsvImport={openCsvImport}
              onSelectTransaction={setSelectedTransaction}
            />
          )}
          {activeTab === 'accounts' && <AccountsView />}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'savings' && <SavingsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'ai' && <AiAssistantView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenMenu={() => setDrawerOpen(true)}
        onOpenNewTransaction={openNewTransaction}
      />

      <NavDrawer
        open={drawerOpen}
        activeTab={activeTab}
        displayName={state.preferences.displayName}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleNavigate}
        onOpenCsvImport={openCsvImport}
      />

      <TransactionFormSheet
        open={txFormOpen}
        initialType={txFormInitialType}
        editingTransaction={editingTransaction}
        onClose={() => setTxFormOpen(false)}
        onOpenAccounts={() => handleNavigate('accounts')}
      />

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onEdit={openEditTransaction}
      />

      <CsvImportModal open={csvModalOpen} onClose={() => setCsvModalOpen(false)} />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <FinoraAppShell />
    </FinanceProvider>
  );
}
