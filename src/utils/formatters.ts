import { AccountType, PeriodPreset, PeriodRange, TransactionType } from '../types/finance';

export function formatIDR(amount: number, options?: { signed?: boolean; type?: TransactionType; hidden?: boolean }): string {
  if (options?.hidden) {
    return 'Rp•••••••';
  }
  const absVal = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('id-ID').format(absVal);

  if (options?.signed && options.type) {
    if (options.type === 'income') return `+Rp${formatted}`;
    if (options.type === 'expense') return `−Rp${formatted}`;
    if (options.type === 'transfer') return `Rp${formatted}`;
  }

  if (amount < 0) {
    return `−Rp${formatted}`;
  }
  return `Rp${formatted}`;
}

export function formatCompactIDR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp${(abs / 1_000_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp${(abs / 1_000_000).toFixed(1).replace('.', ',')}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp${Math.round(abs / 1_000)}rb`;
  }
  return `${sign}Rp${abs}`;
}

export function formatDateID(isoDate: string, includeTime = false): string {
  if (!isoDate) return '-';
  const d = new Date(isoDate.length === 10 ? `${isoDate}T00:00:00` : isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  if (includeTime) {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatMonthKeyID(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return monthKey;
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
}

export function toLocalDateInput(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toLocalDateTimeInput(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function toMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function generateFinoraTxId(): string {
  const raw =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').toUpperCase()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
  return `FIN-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

export function generateEntityId(prefix: string): string {
  const raw =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 12)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return `${prefix}_${raw}`;
}

export function getPeriodRange(
  preset: PeriodPreset,
  customStart?: string,
  customEnd?: string,
  referenceDate = new Date(),
): PeriodRange {
  const todayStr = toLocalDateInput(referenceDate);
  const y = referenceDate.getFullYear();
  const m = referenceDate.getMonth();

  switch (preset) {
    case 'today':
      return {
        preset,
        startDate: todayStr,
        endDate: todayStr,
        label: `Hari Ini (${formatDateID(todayStr)})`,
      };
    case '7d': {
      const start = new Date(referenceDate);
      start.setDate(start.getDate() - 6);
      const startStr = toLocalDateInput(start);
      return {
        preset,
        startDate: startStr,
        endDate: todayStr,
        label: '7 Hari Terakhir',
      };
    }
    case 'this_month': {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return {
        preset,
        startDate: toLocalDateInput(start),
        endDate: toLocalDateInput(end),
        label: `Bulan Ini (${formatMonthKeyID(`${y}-${String(m + 1).padStart(2, '0')}`)})`,
      };
    }
    case 'last_month': {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      const mk = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
      return {
        preset,
        startDate: toLocalDateInput(start),
        endDate: toLocalDateInput(end),
        label: `Bulan Lalu (${formatMonthKeyID(mk)})`,
      };
    }
    case 'this_year': {
      return {
        preset,
        startDate: `${y}-01-01`,
        endDate: `${y}-12-31`,
        label: `Tahun ${y}`,
      };
    }
    case 'custom': {
      const s = customStart || `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const e = customEnd || todayStr;
      const [startDate, endDate] = s <= e ? [s, e] : [e, s];
      return {
        preset,
        startDate,
        endDate,
        label: `${formatDateID(startDate)} – ${formatDateID(endDate)}`,
      };
    }
  }
}

export function getAccountTypeLabel(type: AccountType): string {
  const labels: Record<AccountType, string> = {
    bank: 'Rekening Bank',
    ewallet: 'E-Wallet',
    cash: 'Uang Tunai',
    savings: 'Tabungan',
    other: 'Lainnya',
  };
  return labels[type] || 'Lainnya';
}

export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer: 'Transfer Internal',
    adjustment: 'Penyesuaian Saldo',
  };
  return labels[type];
}
