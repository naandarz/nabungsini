import { Category, Transaction, TransactionType } from '../types/finance';
import { AccountWithBalance } from './financeEngine';
import { generateEntityId, generateFinoraTxId, toLocalDateTimeInput } from './formatters';

export interface ParsedCsvData {
  headers: string[];
  rows: string[][];
  delimiter: ',' | ';';
}

export interface CsvColumnMapping {
  dateIndex: number;
  descriptionIndex: number;
  amountIndex: number; // Single amount column, or -1 if using debit/credit
  debitIndex: number;
  creditIndex: number;
  typeIndex: number;
  categoryIndex: number;
}

export interface CsvPreviewRow {
  rowNumber: number;
  rawDate: string;
  parsedDate: string | null;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  categoryName: string;
  matchedCategoryId?: string;
  isValid: boolean;
  errorReason?: string;
  isDuplicate: boolean;
  include: boolean;
}

function splitCsvLine(line: string, delimiter: ',' | ';'): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCsvText(rawText: string): ParsedCsvData {
  const cleanText = rawText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('File CSV harus memiliki minimal 1 baris header dan 1 baris data.');
  }

  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter: ',' | ';' = semiCount > commaCount ? ';' : ',';

  const headers = splitCsvLine(lines[0], delimiter);
  const rows = lines.slice(1).map((line) => splitCsvLine(line, delimiter));

  return { headers, rows, delimiter };
}

export function guessCsvMapping(headers: string[]): CsvColumnMapping {
  const norm = headers.map((h) => h.toLowerCase().trim());
  const findIdx = (keywords: string[]) =>
    norm.findIndex((h) => keywords.some((kw) => h.includes(kw)));

  return {
    dateIndex: findIdx(['tanggal', 'date', 'tgl', 'waktu']),
    descriptionIndex: findIdx(['deskripsi', 'keterangan', 'description', 'uraian', 'catatan', 'memo']),
    amountIndex: findIdx(['nominal', 'jumlah', 'amount', 'nilai', 'total']),
    debitIndex: findIdx(['debit', 'keluar', 'pengeluaran', 'db']),
    creditIndex: findIdx(['kredit', 'credit', 'masuk', 'pemasukan', 'cr']),
    typeIndex: findIdx(['jenis', 'tipe', 'type', 'arus']),
    categoryIndex: findIdx(['kategori', 'category']),
  };
}

export function parseIndonesianAmount(raw: string): number {
  if (!raw) return 0;
  let cleaned = raw.replace(/rp/gi, '').replace(/\s+/g, '').trim();
  if (!cleaned) return 0;

  // Handle negative indicators like (50.000) or -50000
  const isParenNeg = cleaned.startsWith('(') && cleaned.endsWith(')');
  cleaned = cleaned.replace(/[()]/g, '');

  // If format is 1.250.000,00 -> remove dots and drop decimal part after comma
  if (/^\-?\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').split(',')[0];
  } else if (/^\-?\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(cleaned)) {
    // 1,250,000.00
    cleaned = cleaned.replace(/,/g, '').split('.')[0];
  } else {
    cleaned = cleaned.replace(/[.,]\d{2}$/, '').replace(/[.,]/g, '');
  }

  const num = parseInt(cleaned, 10);
  if (Number.isNaN(num)) return 0;
  return isParenNeg ? -Math.abs(num) : num;
}

export function parseFlexibleDate(raw: string): string | null {
  const val = raw.trim();
  if (!val) return null;

  // ISO YYYY-MM-DD or YYYY-MM-DD HH:mm
  const isoMatch = val.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (isoMatch) {
    const [, y, m, d, hh = '12', mm = '00'] = isoMatch;
    const dt = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm));
    if (!Number.isNaN(dt.getTime())) return toLocalDateTimeInput(dt);
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = val.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (dmyMatch) {
    const [, d, m, y, hh = '12', mm = '00'] = dmyMatch;
    const dt = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm));
    if (!Number.isNaN(dt.getTime())) return toLocalDateTimeInput(dt);
  }

  const fallback = new Date(val);
  if (!Number.isNaN(fallback.getTime())) {
    return toLocalDateTimeInput(fallback);
  }
  return null;
}

export function buildCsvPreviewRows(
  rows: string[][],
  mapping: CsvColumnMapping,
  targetAccountId: string,
  existingTransactions: Transaction[],
  categories: Category[],
): CsvPreviewRow[] {
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
  const existingKeys = new Set(
    existingTransactions
      .filter((tx) => tx.accountId === targetAccountId)
      .map(
        (tx) =>
          `${tx.date.slice(0, 10)}|${tx.amount}|${tx.description.trim().toLowerCase()}`,
      ),
  );

  return rows.map((row, idx) => {
    const rawDate = mapping.dateIndex >= 0 ? row[mapping.dateIndex] || '' : '';
    const parsedDate = parseFlexibleDate(rawDate);
    const description =
      (mapping.descriptionIndex >= 0 ? row[mapping.descriptionIndex] : '')?.trim() ||
      'Transaksi Impor';

    let type: 'income' | 'expense' = 'expense';
    let amount = 0;

    if (mapping.debitIndex >= 0 || mapping.creditIndex >= 0) {
      const debitVal = Math.abs(
        parseIndonesianAmount(mapping.debitIndex >= 0 ? row[mapping.debitIndex] || '' : ''),
      );
      const creditVal = Math.abs(
        parseIndonesianAmount(mapping.creditIndex >= 0 ? row[mapping.creditIndex] || '' : ''),
      );
      if (creditVal > 0 && debitVal === 0) {
        type = 'income';
        amount = creditVal;
      } else if (debitVal > 0) {
        type = 'expense';
        amount = debitVal;
      }
    }

    if (amount === 0 && mapping.amountIndex >= 0) {
      const rawAmt = parseIndonesianAmount(row[mapping.amountIndex] || '');
      const typeStr =
        mapping.typeIndex >= 0 ? (row[mapping.typeIndex] || '').toLowerCase() : '';
      if (
        typeStr.includes('masuk') ||
        typeStr.includes('income') ||
        typeStr.includes('kredit') ||
        typeStr.includes('cr')
      ) {
        type = 'income';
      } else if (
        typeStr.includes('keluar') ||
        typeStr.includes('expense') ||
        typeStr.includes('debit') ||
        typeStr.includes('db')
      ) {
        type = 'expense';
      } else if (rawAmt > 0 && mapping.typeIndex < 0) {
        type = 'income';
      } else if (rawAmt < 0) {
        type = 'expense';
      }
      amount = Math.abs(rawAmt);
    }

    const rawCat =
      mapping.categoryIndex >= 0 ? (row[mapping.categoryIndex] || '').trim() : '';
    const matchedCat = rawCat ? catByName.get(rawCat.toLowerCase()) : undefined;

    let isValid = true;
    let errorReason: string | undefined;

    if (!parsedDate) {
      isValid = false;
      errorReason = 'Format tanggal tidak dikenali';
    } else if (amount <= 0) {
      isValid = false;
      errorReason = 'Nominal harus lebih dari 0';
    }

    const dupKey = parsedDate
      ? `${parsedDate.slice(0, 10)}|${amount}|${description.toLowerCase()}`
      : '';
    const isDuplicate = Boolean(isValid && dupKey && existingKeys.has(dupKey));

    return {
      rowNumber: idx + 1,
      rawDate,
      parsedDate,
      description,
      type,
      amount,
      categoryName: matchedCat?.name || rawCat || 'Belum dikategorikan',
      matchedCategoryId: matchedCat?.id,
      isValid,
      errorReason,
      isDuplicate,
      include: isValid && !isDuplicate,
    };
  });
}

export function createTransactionsFromCsvRows(
  rows: CsvPreviewRow[],
  targetAccountId: string,
): Transaction[] {
  const batchId = generateEntityId('imp');
  const now = new Date().toISOString();

  return rows
    .filter((r) => r.include && r.isValid && r.parsedDate && r.amount > 0)
    .map((r) => ({
      id: generateFinoraTxId(),
      type: r.type as TransactionType,
      amount: Math.round(r.amount),
      date: r.parsedDate!,
      accountId: targetAccountId,
      categoryId: r.matchedCategoryId,
      description: r.description,
      note: 'Diimpor dari file CSV',
      source: 'import',
      status: r.matchedCategoryId ? 'tercatat' : 'perlu_ditinjau',
      attachmentIds: [],
      importBatchId: batchId,
      createdAt: now,
      updatedAt: now,
    }));
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  accounts: AccountWithBalance[],
  categories: Category[],
): string {
  const accMap = new Map(accounts.map((a) => [a.id, a.name]));
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const escapeCell = (val: string | number | undefined) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    'ID Transaksi',
    'Tanggal',
    'Jenis',
    'Deskripsi',
    'Nominal (IDR)',
    'Akun Sumber',
    'Akun Tujuan',
    'Kategori',
    'Sumber Pencatatan',
    'Status',
    'Catatan',
    'Jumlah Lampiran',
  ];

  const lines = transactions.map((tx) =>
    [
      tx.id,
      tx.date.replace('T', ' '),
      tx.type,
      tx.description,
      tx.amount,
      accMap.get(tx.accountId) || tx.accountId,
      tx.destinationAccountId ? accMap.get(tx.destinationAccountId) || tx.destinationAccountId : '',
      tx.categoryId ? catMap.get(tx.categoryId) || '' : '',
      tx.source,
      tx.status,
      tx.note || '',
      tx.attachmentIds.length,
    ]
      .map(escapeCell)
      .join(','),
  );

  // UTF-8 BOM so Indonesian Excel opens cleanly
  return '\uFEFF' + [headers.join(','), ...lines].join('\n');
}
