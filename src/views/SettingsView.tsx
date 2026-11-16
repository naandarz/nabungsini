import React, { useState } from 'react';
import { Download, Monitor, Moon, Plus, Sparkles, Sun, Trash2, Upload } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';
import { useTheme, type ThemeMode } from '../hooks/useTheme';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
];

export function SettingsView() {
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const {
    state,
    updatePreferences,
    addCategory,
    deleteCategory,
    loadDemoData,
    resetAllData,
    importBackupJson,
    showToast,
  } = useFinance();

  const [displayName, setDisplayName] = useState(state.preferences.displayName);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#6655D9');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({ displayName: displayName.trim() || 'Pengguna Finora' });
    showToast('success', 'Profil tampilan diperbarui.');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName, newCatType, newCatColor);
    setNewCatName('');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Cadangan data JSON berhasil diunduh.');
  };

  const handleRestoreJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      importBackupJson(text);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'File cadangan tidak valid.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title="Pengaturan & Data"
        description="Kelola preferensi tampilan, kategori kustom, privasi AI, serta cadangan data lokal."
      />

      {/* Appearance */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Tampilan</h2>
            <p className="text-xs text-text-secondary mt-1">
              Pilih tema terang, gelap, atau ikuti pengaturan perangkat Anda.
            </p>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Tema tampilan"
          className="inline-flex w-full max-w-xs gap-1 rounded-xl border border-border bg-surface-muted p-1"
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = themeMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setThemeMode(option.value)}
                className={`press flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile & Preferences */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4"
      >
        <h2 className="text-base font-semibold text-text-primary">Preferensi Pengguna</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Nama Tampilan</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-border text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Mata Uang Utama
            </label>
            <input
              type="text"
              value="Rupiah (IDR)"
              disabled
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface-muted text-sm text-text-secondary"
            />
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <label className="flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={state.preferences.hideBalances}
              onChange={(e) => updatePreferences({ hideBalances: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            Sembunyikan nominal saldo di dashboard secara default
          </label>
          <label className="flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={state.preferences.aiConsentEnabled}
              onChange={(e) => updatePreferences({ aiConsentEnabled: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            Izinkan AI Financial Assistant membaca ringkasan metrik teragregasi
          </label>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium"
          >
            Simpan Preferensi
          </button>
        </div>
      </form>

      {/* Categories Management */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold text-text-primary">Kategori Transaksi</h2>

        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nama kategori baru..."
            className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-border text-sm"
            required
          />
          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as 'expense' | 'income')}
            className="min-h-[44px] px-3 rounded-xl border border-border text-sm bg-surface"
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
          <input
            type="color"
            value={newCatColor}
            onChange={(e) => setNewCatColor(e.target.value)}
            aria-label="Warna kategori"
            className="h-[44px] w-14 rounded-xl border border-border p-1 bg-surface cursor-pointer"
          />
          <button
            type="submit"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </form>

        <div className="divide-y divide-border border border-border rounded-xl">
          {state.categories.map((cat) => (
            <div key={cat.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-text-primary truncate">{cat.name}</span>
                <span className="text-xs text-text-secondary">
                  · {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              </div>
              {!cat.isDefault ? (
                <button
                  type="button"
                  onClick={() => deleteCategory(cat.id)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-text-secondary hover:text-expense hover:bg-expense-soft"
                  aria-label={`Hapus kategori ${cat.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs text-neutral">Bawaan</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Governance & Backup */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Cadangan & Kontrol Data Lokal</h2>
          <p className="text-xs text-text-secondary mt-1">
            Data disimpan secara lokal di browser perangkat ini. Unduh cadangan JSON secara berkala
            untuk memindahkan data ke perangkat lain.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleExportJson}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-border hover:bg-surface-muted text-sm font-medium text-text-primary inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-primary" />
            Ekspor Cadangan JSON
          </button>

          <label className="min-h-[44px] px-4 py-2 rounded-xl border border-border hover:bg-surface-muted text-sm font-medium text-text-primary inline-flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-income" />
            Pulihkan dari JSON
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleRestoreJson}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={loadDemoData}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-border hover:bg-primary-soft/50 text-sm font-medium text-text-primary inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Muat Data Contoh
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-expense/35 hover:bg-expense-soft text-sm font-medium text-expense inline-flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Kosongkan Semua Data
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Kosongkan Seluruh Data Lokal?"
        description="Seluruh akun, transaksi, lampiran bukti, anggaran, target tabungan, dan riwayat AI di browser ini akan dihapus permanen."
        confirmLabel="Ya, Kosongkan Data"
        destructive
        onConfirm={async () => {
          await resetAllData();
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
