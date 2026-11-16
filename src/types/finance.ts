export type AccountType = 'bank' | 'ewallet' | 'cash' | 'savings' | 'other';

export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';

export type TransactionSource = 'manual' | 'import' | 'system';

export type TransactionStatus = 'tercatat' | 'perlu_ditinjau';

export type PeriodPreset =
  | 'today'
  | '7d'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  openingBalance: number; // Integer IDR
  includeInTotal: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  isDefault: boolean;
}

export interface AttachmentMeta {
  id: string;
  transactionId: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface Transaction {
  id: string; // Permanent internal ID e.g. FIN-7F3A-92D1
  type: TransactionType;
  amount: number; // Always positive integer IDR (> 0)
  date: string; // ISO YYYY-MM-DDTHH:mm
  accountId: string;
  destinationAccountId?: string; // Required when type === 'transfer'
  adjustmentDirection?: 'increase' | 'decrease'; // Used when type === 'adjustment'
  categoryId?: string; // Used for income/expense
  description: string;
  note?: string;
  source: TransactionSource;
  status: TransactionStatus;
  attachmentIds: string[];
  importBatchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthKey: string; // YYYY-MM
  limitAmount: number; // Integer IDR > 0
  warningThreshold: number; // e.g. 80 (%)
  createdAt: string;
  updatedAt: string;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  type: 'deposit' | 'withdraw';
  amount: number; // Integer IDR > 0
  date: string; // YYYY-MM-DD
  note?: string;
  linkedTransferId?: string;
  createdAt: string;
}

export type GoalPriority = 'tinggi' | 'sedang' | 'rendah';
export type GoalStatus = 'aktif' | 'tercapai' | 'ditunda';

export interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number; // Integer IDR > 0
  targetDate?: string; // YYYY-MM-DD
  priority: GoalPriority;
  status: GoalStatus;
  contributions: SavingsContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  periodLabel?: string;
  createdAt: string;
}

export interface UserPreferences {
  displayName: string;
  hideBalances: boolean;
  aiConsentEnabled: boolean;
  defaultWarningThreshold: number;
}

export interface FinoraState {
  version: number;
  preferences: UserPreferences;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  aiHistory: AiChatMessage[];
}

export interface PeriodRange {
  preset: PeriodPreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
