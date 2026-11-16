import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  buildCsvPreviewRows,
  createTransactionsFromCsvRows,
  CsvColumnMapping,
  CsvPreviewRow,
  guessCsvMapping,
  ParsedCsvData,
  parseCsvText,
} from '../../utils/csvEngine';
import { formatDateID, formatIDR } from '../../utils/formatters';
import { useDialogA11y } from '../../hooks/useDialogA11y';

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function CsvImportModal({ open, onClose }: CsvImportModalProps) {
  const { state, activeAccounts, importTransactionsBatch, showToast } = useFinance();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetAccountId, setTargetAccountId] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedCsv, setParsedCsv] = useState<ParsedCsvData | null>(null);
  const [mapping, setMapping] = useState<CsvColumnMapping | null>(null);
  const [previewRows, setPreviewRows] = useState<CsvPreviewRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedAccountId = targetAccountId || activeAccounts[0]?.id || '';

  const validCount = useMemo(
    () => previewRows.filter((r) => r.isValid && r.include).length,
    [previewRows],
  );
  const duplicateCount = useMemo(
    () => previewRows.filter((r) => r.isDuplicate).length,
    [previewRows],
  );
  const invalidCount = useMemo(
    () => previewRows.filter((r) => !r.isValid).length,
    [previewRows],
  );

  const dialogRef = useDialogA11y<HTMLDivElement>({ open, onClose });

  if (!open) return null;

  const resetModal = () => {
    setStep(1);
    setFileName('');
    setParsedCsv(null);
    setMapping(null);
    setPreviewRows([]);
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleDownloadSampleCsv = () => {
    const sample = [
      'Tanggal,Deskripsi,Jenis,Nominal,Kategori',
      '2026-11-01,Gaji Bulanan,Pemasukan,7500000,Gaji',
      '2026-11-02,Belanja Supermarket,Pengeluaran,320000,Belanja Harian',
      '2026-11-03,Kopi & Makan Siang,Pengeluaran,85000,Makan & Minum',
    ].join('\n');
    const blob = new Blob(['\uFEFF' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contoh-mutasi-finora.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Pilih file berformat .csv (UTF-8 atau hasil ekspor Excel).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file CSV maksimal 3 MB.');
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCsvText(text);
      const guessed = guessCsvMapping(parsed.headers);
      setFileName(file.name);
      setParsedCsv(parsed);
      setMapping(guessed);
      setStep(2);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal membaca file CSV.');
    } finally {
      e.target.value = '';
    }
  };

  const handleGeneratePreview = () => {
    if (!parsedCsv || !mapping || !selectedAccountId) return;
    if (mapping.dateIndex < 0) {
      setErrorMsg('Pilih kolom Tanggal terlebih dahulu.');
      return;
    }
    if (mapping.amountIndex < 0 && mapping.debitIndex < 0 && mapping.creditIndex < 0) {
      setErrorMsg('Pilih kolom Nominal atau kolom Debit/Kredit.');
      return;
    }
    setErrorMsg(null);
    const rows = buildCsvPreviewRows(
      parsedCsv.rows,
      mapping,
      selectedAccountId,
      state.transactions,
      state.categories,
    );
    setPreviewRows(rows);
    setStep(3);
  };

  const handleToggleRow = (rowNumber: number) => {
    setPreviewRows((prev) =>
      prev.map((r) => (r.rowNumber === rowNumber && r.isValid ? { ...r, include: !r.include } : r)),
    );
  };

  const handleConfirmImport = () => {
    if (!selectedAccountId) return;
    const toImport = createTransactionsFromCsvRows(previewRows, selectedAccountId);
    if (toImport.length === 0) {
      showToast('warning', 'Tidak ada baris valid yang dipilih untuk diimpor.');
      return;
    }
    importTransactionsBatch(toImport);
    handleClose();
  };

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#202238]/45 backdrop-blur-[2px] p-0 md:p-4 focus:outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-title"
    >
      <div className="modal-panel w-full md:max-w-3xl bg-white border border-[#E8E9F1] rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E8E9F1]">
          <div>
            <h2 id="csv-import-title" className="text-lg font-semibold text-[#202238]">
              Impor Mutasi CSV
            </h2>
            <p className="text-xs text-[#74778B] mt-0.5">
              Langkah {step} dari 3 · Pratinjau dan deteksi duplikasi otomatis
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#74778B] hover:bg-[#F6F7FB]"
            aria-label="Tutup impor CSV"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {activeAccounts.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-sm font-medium text-[#202238]">Belum ada akun tujuan</p>
              <p className="text-xs text-[#74778B]">
                Buat minimal satu akun rekening atau e-wallet sebelum mengimpor mutasi CSV.
              </p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="csv-target-account"
                      className="block text-xs font-medium text-[#74778B] mb-1.5"
                    >
                      Akun Tujuan Impor *
                    </label>
                    <select
                      id="csv-target-account"
                      value={selectedAccountId}
                      onChange={(e) => setTargetAccountId(e.target.value)}
                      data-autofocus
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#E8E9F1] bg-white text-sm text-[#202238]"
                    >
                      {activeAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.institution || acc.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="block border-2 border-dashed border-[#E8E9F1] hover:border-[#6655D9]/60 rounded-2xl p-8 text-center cursor-pointer bg-[#F6F7FB]/60 transition-colors">
                    <Upload className="w-8 h-8 text-[#6655D9] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[#202238]">
                      Klik untuk memilih file CSV mutasi
                    </p>
                    <p className="text-xs text-[#74778B] mt-1">
                      Mendukung pemisah koma (,) maupun titik koma (;) dari ekspor Excel
                    </p>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-[#74778B]">
                      Butuh contoh struktur kolom yang langsung siap pakai?
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadSampleCsv}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6655D9] hover:text-[#4938B5]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh Template CSV
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && parsedCsv && mapping && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F6F7FB] border border-[#E8E9F1] text-xs text-[#202238]">
                    <FileSpreadsheet className="w-4 h-4 text-[#6655D9] shrink-0" />
                    <span className="font-medium truncate">{fileName}</span>
                    <span className="text-[#74778B] shrink-0">
                      · {parsedCsv.rows.length} baris ditemukan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#74778B] mb-1">
                        Kolom Tanggal *
                      </label>
                      <select
                        value={mapping.dateIndex}
                        onChange={(e) =>
                          setMapping({ ...mapping, dateIndex: Number(e.target.value) })
                        }
                        className="w-full min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-sm"
                      >
                        <option value={-1}>-- Pilih kolom --</option>
                        {parsedCsv.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#74778B] mb-1">
                        Kolom Deskripsi / Keterangan
                      </label>
                      <select
                        value={mapping.descriptionIndex}
                        onChange={(e) =>
                          setMapping({ ...mapping, descriptionIndex: Number(e.target.value) })
                        }
                        className="w-full min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-sm"
                      >
                        <option value={-1}>-- Tidak ada --</option>
                        {parsedCsv.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#74778B] mb-1">
                        Kolom Nominal Tunggal
                      </label>
                      <select
                        value={mapping.amountIndex}
                        onChange={(e) =>
                          setMapping({ ...mapping, amountIndex: Number(e.target.value) })
                        }
                        className="w-full min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-sm"
                      >
                        <option value={-1}>-- Pakai kolom Debit/Kredit --</option>
                        {parsedCsv.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#74778B] mb-1">
                        Kolom Jenis (Masuk / Keluar)
                      </label>
                      <select
                        value={mapping.typeIndex}
                        onChange={(e) =>
                          setMapping({ ...mapping, typeIndex: Number(e.target.value) })
                        }
                        className="w-full min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-sm"
                      >
                        <option value={-1}>-- Deteksi otomatis --</option>
                        {parsedCsv.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#74778B] mb-1">
                        Kolom Debit / Keluar (Opsional)
                      </label>
                      <select
                        value={mapping.debitIndex}
                        onChange={(e) =>
                          setMapping({ ...mapping, debitIndex: Number(e.target.value) })
                        }
                        className="w-full min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-sm"
                      >
                        <option value={-1}>-- Tidak ada --</option>
                        {parsedCsv.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#74778B] mb-1">
                        Kolom Kredit / Masuk (Opsional)
                      </label>
                      <select
                        value={mapping.creditIndex}
                        onChange={(e) =>
                          setMapping({ ...mapping, creditIndex: Number(e.target.value) })
                        }
                        className="w-full min-h-[44px] px-3 rounded-xl border border-[#E8E9F1] text-sm"
                      >
                        <option value={-1}>-- Tidak ada --</option>
                        {parsedCsv.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-[#E8F8F1] border border-[#16A779]/25">
                      <p className="text-lg font-mono font-bold text-[#16A779]">{validCount}</p>
                      <p className="text-xs text-[#202238]">Siap Diimpor</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFF8EB] border border-[#E5A13A]/25">
                      <p className="text-lg font-mono font-bold text-[#E5A13A]">
                        {duplicateCount}
                      </p>
                      <p className="text-xs text-[#202238]">Terduga Duplikat</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFF0F3] border border-[#E65378]/25">
                      <p className="text-lg font-mono font-bold text-[#E65378]">{invalidCount}</p>
                      <p className="text-xs text-[#202238]">Baris Invalid</p>
                    </div>
                  </div>

                  <div className="border border-[#E8E9F1] rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F6F7FB] text-[#74778B] sticky top-0 border-b border-[#E8E9F1]">
                        <tr>
                          <th className="py-2.5 px-3">Pilih</th>
                          <th className="py-2.5 px-3">Tanggal</th>
                          <th className="py-2.5 px-3">Deskripsi</th>
                          <th className="py-2.5 px-3 text-right">Nominal</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E9F1]">
                        {previewRows.map((row) => (
                          <tr key={row.rowNumber} className={!row.isValid ? 'bg-[#FFF0F3]/40' : ''}>
                            <td className="py-2.5 px-3">
                              <input
                                type="checkbox"
                                checked={row.include}
                                disabled={!row.isValid}
                                onChange={() => handleToggleRow(row.rowNumber)}
                                className="w-4 h-4 accent-[#6655D9]"
                                aria-label={`Pilih baris ${row.rowNumber}`}
                              />
                            </td>
                            <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                              {row.parsedDate ? formatDateID(row.parsedDate) : row.rawDate || '-'}
                            </td>
                            <td className="py-2.5 px-3 max-w-[180px] truncate">{row.description}</td>
                            <td
                              className={`py-2.5 px-3 font-mono tabular-nums text-right whitespace-nowrap ${
                                row.type === 'income' ? 'text-[#16A779]' : 'text-[#E65378]'
                              }`}
                            >
                              {row.amount > 0
                                ? formatIDR(row.amount, { signed: true, type: row.type })
                                : '-'}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {!row.isValid ? (
                                <span className="text-[#E65378] font-medium">
                                  {row.errorReason}
                                </span>
                              ) : row.isDuplicate ? (
                                <span className="inline-flex items-center gap-1 text-[#E5A13A] font-medium">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Duplikat
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[#16A779] font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Valid
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="px-3.5 py-2.5 rounded-xl bg-[#FFF0F3] border border-[#E65378]/30 text-xs font-medium text-[#E65378]"
                >
                  {errorMsg}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-[#E8E9F1] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step === 3 ? 2 : 1)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E8E9F1] text-sm font-medium text-[#202238] hover:bg-[#F6F7FB]"
            >
              Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E8E9F1] text-sm font-medium text-[#202238] hover:bg-[#F6F7FB]"
            >
              Tutup
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleGeneratePreview}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6655D9] hover:bg-[#4938B5] text-white text-sm font-medium"
            >
              Lanjut Pratinjau
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#6655D9] hover:bg-[#4938B5] disabled:opacity-50 text-white text-sm font-medium"
            >
              Impor {validCount} Transaksi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
