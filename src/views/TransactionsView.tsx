import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Paperclip,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType } from '../types/finance';
import { exportTransactionsToCsv } from '../utils/csvEngine';
import { filterTransactions } from '../utils/financeEngine';
import { formatDateID, formatIDR, getTransactionTypeLabel } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';

interface TransactionsViewProps {
  onOpenNewTx: (type: TransactionType) => void;
  onOpenCsvImport: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export function TransactionsView({
  onOpenNewTx,
  onOpenCsvImport,
  onSelectTransaction,
}: TransactionsViewProps) {
  const { state, accountsWithBalances, showToast } = useFinance();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'manual' | 'import' | 'system'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>(
    'date_desc',
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hidden = state.preferences.hideBalances;

  const filtered = useMemo(
    () =>
      filterTransactions(state.transactions, state.categories, {
        search,
        type: typeFilter,
        accountId: accountFilter,
        categoryId: categoryFilter,
        source: sourceFilter,
        startDate,
        endDate,
        sortBy,
      }),
    [
      state.transactions,
      state.categories,
      search,
      typeFilter,
      accountFilter,
      categoryFilter,
      sourceFilter,
      startDate,
      endDate,
      sortBy,
    ],
  );

  const summary = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      showToast('warning', 'Tidak ada transaksi untuk diekspor.');
      return;
    }
    const csvContent = exportTransactionsToCsv(filtered, accountsWithBalances, state.categories);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', `${filtered.length} transaksi diekspor ke CSV.`);
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setAccountFilter('all');
    setCategoryFilter('all');
    setSourceFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date_desc');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Riwayat Transaksi"
        description="Setiap transaksi memiliki ID permanen yang dapat disalin serta dukungan lampiran bukti."
        actions={
          <>
            <button
              type="button"
              onClick={onOpenCsvImport}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-[#E8E9F1] bg-white px-3.5 py-2 text-xs font-medium text-[#202238] hover:bg-[#F6F7FB] sm:text-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#6655D9]" />
              Impor CSV
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-[#E8E9F1] bg-white px-3.5 py-2 text-xs font-medium text-[#202238] hover:bg-[#F6F7FB] sm:text-sm"
            >
              <Download className="h-4 w-4 text-[#74778B]" />
              Ekspor CSV
            </button>
            <button
              type="button"
              onClick={() => onOpenNewTx('expense')}
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-[#6655D9] px-4 py-2 text-xs font-medium text-white hover:bg-[#4938B5] sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </button>
          </>
        }
      />

      {/* Search & Filter Panel */}
      <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#74778B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari deskripsi, kategori, catatan, atau ID (FIN-...)..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#E8E9F1] text-sm text-[#202238] focus:outline-none focus:border-[#6655D9]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['all', 'Semua'],
                ['income', 'Pemasukan'],
                ['expense', 'Pengeluaran'],
                ['transfer', 'Transfer'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setTypeFilter(val)}
                className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  typeFilter === val
                    ? 'bg-[#6655D9] text-white'
                    : 'bg-[#F6F7FB] text-[#74778B] hover:text-[#202238]'
                }`}
              >
                {label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowAdvancedFilters((v) => !v)}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                showAdvancedFilters
                  ? 'border-[#6655D9] bg-[#F0EDFF] text-[#4938B5]'
                  : 'border-[#E8E9F1] bg-white text-[#202238]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter Lanjutan
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="pt-3 border-t border-[#E8E9F1] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              aria-label="Filter akun"
              className="min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-xs text-[#202238] bg-white"
            >
              <option value="all">Semua Akun</option>
              {accountsWithBalances.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter kategori"
              className="min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-xs text-[#202238] bg-white"
            >
              <option value="all">Semua Kategori</option>
              {state.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as 'all' | 'manual' | 'import' | 'system')
              }
              aria-label="Filter sumber"
              className="min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-xs text-[#202238] bg-white"
            >
              <option value="all">Semua Sumber</option>
              <option value="manual">Input Manual</option>
              <option value="import">Impor CSV</option>
              <option value="system">Penyesuaian Sistem</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Dari tanggal"
              className="min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-xs text-[#202238] bg-white"
            />

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="Sampai tanggal"
                className="flex-1 min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-xs text-[#202238] bg-white"
              />
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-xs font-medium text-[#74778B] hover:text-[#202238] whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Filter Totals & Sort */}
        <div className="pt-2 border-t border-[#E8E9F1] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-[#74778B]">
            <span>{filtered.length} transaksi</span>
            <span>·</span>
            <span className="font-mono tabular-nums text-[#16A779]">
              +{formatIDR(summary.income, { hidden })}
            </span>
            <span>·</span>
            <span className="font-mono tabular-nums text-[#E65378]">
              −{formatIDR(summary.expense, { hidden })}
            </span>
          </div>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc',
              )
            }
            aria-label="Urutkan transaksi"
            className="min-h-[40px] px-2.5 rounded-lg border border-[#E8E9F1] text-xs text-[#202238] bg-white"
          >
            <option value="date_desc">Terbaru</option>
            <option value="date_asc">Terlama</option>
            <option value="amount_desc">Nominal Terbesar</option>
            <option value="amount_asc">Nominal Terkecil</option>
          </select>
        </div>
      </div>

      {/* Results List / Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="Tidak ada transaksi ditemukan"
          description={
            state.transactions.length === 0
              ? 'Belum ada transaksi yang tercatat. Tambah transaksi manual atau impor dari mutasi CSV.'
              : 'Tidak ada transaksi yang cocok dengan kata kunci atau filter saat ini.'
          }
          primaryAction={{
            label: state.transactions.length === 0 ? 'Tambah Transaksi' : 'Reset Filter',
            onClick:
              state.transactions.length === 0 ? () => onOpenNewTx('expense') : resetFilters,
          }}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#E8E9F1] bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[#F6F7FB] border-b border-[#E8E9F1] text-xs font-medium text-[#74778B]">
                <tr>
                  <th className="py-3 px-4">Waktu & ID</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4">Kategori & Jenis</th>
                  <th className="py-3 px-4">Akun</th>
                  <th className="py-3 px-4">Sumber</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E9F1] text-sm">
                {filtered.map((tx) => {
                  const cat = state.categories.find((c) => c.id === tx.categoryId);
                  const srcAcc = accountsWithBalances.find((a) => a.id === tx.accountId);
                  const dstAcc = tx.destinationAccountId
                    ? accountsWithBalances.find((a) => a.id === tx.destinationAccountId)
                    : undefined;

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="hover:bg-[#F6F7FB]/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="text-xs font-medium text-[#202238]">
                          {formatDateID(tx.date, true)}
                        </p>
                        <p className="text-[11px] font-mono text-[#74778B] mt-0.5">{tx.id}</p>
                      </td>
                      <td className="py-3 px-4 max-w-[240px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#202238] truncate">
                            {tx.description}
                          </span>
                          {tx.attachmentIds.length > 0 && (
                            <Paperclip
                              className="w-3.5 h-3.5 text-[#6655D9] shrink-0"
                              aria-label="Ada bukti transaksi"
                            />
                          )}
                        </div>
                        {tx.note && (
                          <p className="text-xs text-[#74778B] truncate mt-0.5">{tx.note}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-[#74778B]">
                        <span className="text-[#202238] font-medium">
                          {cat?.name || getTransactionTypeLabel(tx.type)}
                        </span>
                        <span className="block text-[11px] text-[#74778B]">
                          {getTransactionTypeLabel(tx.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-[#202238]">
                        {tx.type === 'transfer'
                          ? `${srcAcc?.name || '?'} → ${dstAcc?.name || '?'}`
                          : srcAcc?.name || '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-[#74778B]">
                        {tx.source === 'import'
                          ? 'Impor CSV'
                          : tx.source === 'system'
                          ? 'Sistem'
                          : 'Manual'}
                      </td>
                      <td
                        className={`py-3 px-4 whitespace-nowrap text-right font-mono font-semibold tabular-nums ${
                          tx.type === 'income'
                            ? 'text-[#16A779]'
                            : tx.type === 'expense'
                            ? 'text-[#E65378]'
                            : 'text-[#202238]'
                        }`}
                      >
                        {tx.type === 'adjustment'
                          ? `${tx.adjustmentDirection === 'decrease' ? '−' : '+'}${formatIDR(
                              tx.amount,
                              { hidden },
                            )}`
                          : formatIDR(tx.amount, { signed: true, type: tx.type, hidden })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Touch Card List */}
          <div className="lg:hidden bg-white border border-[#E8E9F1] rounded-2xl divide-y divide-[#E8E9F1]">
            {filtered.map((tx) => {
              const cat = state.categories.find((c) => c.id === tx.categoryId);
              const srcAcc = accountsWithBalances.find((a) => a.id === tx.accountId);
              const dstAcc = tx.destinationAccountId
                ? accountsWithBalances.find((a) => a.id === tx.destinationAccountId)
                : undefined;

              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => onSelectTransaction(tx)}
                  className="w-full min-h-[64px] px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F6F7FB] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-[#E8F8F1] text-[#16A779]'
                          : tx.type === 'expense'
                          ? 'bg-[#FFF0F3] text-[#E65378]'
                          : 'bg-[#EEF6FF] text-[#3989D8]'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : tx.type === 'expense' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-[#202238] truncate">
                          {tx.description}
                        </p>
                        {tx.attachmentIds.length > 0 && (
                          <Paperclip className="w-3.5 h-3.5 text-[#6655D9] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#74778B] truncate mt-0.5">
                        {cat?.name || getTransactionTypeLabel(tx.type)} ·{' '}
                        {tx.type === 'transfer'
                          ? `${srcAcc?.name || '?'} → ${dstAcc?.name || '?'}`
                          : srcAcc?.name || '-'}{' '}
                        · {formatDateID(tx.date)}
                      </p>
                      <p className="text-[11px] font-mono text-[#8B8EA3] mt-0.5">{tx.id}</p>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-sm font-semibold tabular-nums shrink-0 ${
                      tx.type === 'income'
                        ? 'text-[#16A779]'
                        : tx.type === 'expense'
                        ? 'text-[#E65378]'
                        : 'text-[#202238]'
                    }`}
                  >
                    {tx.type === 'adjustment'
                      ? `${tx.adjustmentDirection === 'decrease' ? '−' : '+'}${formatIDR(
                          tx.amount,
                          { hidden },
                        )}`
                      : formatIDR(tx.amount, { signed: true, type: tx.type, hidden })}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
