import React, { useMemo, useState } from 'react';
import { AlertCircle, Bot, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { PeriodPreset } from '../types/finance';
import { buildVerifiedAiSummary } from '../utils/financeEngine';
import { formatDateID, generateEntityId, getPeriodRange } from '../utils/formatters';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';

const STARTER_PROMPTS = [
  'Ringkas kondisi pemasukan dan pengeluaran saya pada periode ini.',
  'Kategori pengeluaran mana yang paling besar dan bagaimana langkah penghematan praktisnya?',
  'Apakah anggaran bulan ini masih aman atau ada yang mendekati batas?',
  'Bagaimana progres target tabungan saya saat ini?',
];

export function AiAssistantView() {
  const { state, appendAiMessages, clearAiHistory, updatePreferences, showToast } = useFinance();
  const [preset, setPreset] = useState<PeriodPreset>('this_month');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const periodRange = useMemo(() => getPeriodRange(preset), [preset]);
  const verifiedSummary = useMemo(
    () => buildVerifiedAiSummary(state, periodRange),
    [state, periodRange],
  );

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    if (!state.preferences.aiConsentEnabled) {
      setErrorBanner(
        'Izin analisis AI sedang dimatikan. Aktifkan izin pemrosesan ringkasan data di atas untuk menggunakan Asisten AI.',
      );
      return;
    }

    setErrorBanner(null);
    const userMsg = {
      id: generateEntityId('msg'),
      role: 'user' as const,
      content: trimmed,
      periodLabel: periodRange.label,
      createdAt: new Date().toISOString(),
    };
    appendAiMessages([userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          periodLabel: periodRange.label,
          history: state.aiHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          financialSummary: verifiedSummary,
        }),
      });

      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      // Static hosting (e.g. GitHub Pages) has no /api/ai/chat backend, so the
      // request can return an HTML error page instead of JSON.
      const data = isJson
        ? ((await response.json()) as { reply?: string; error?: string; periodLabel?: string })
        : {};
      if (!response.ok || !data.reply) {
        throw new Error(
          data.error ||
            (isJson
              ? 'Asisten AI belum dapat merespons saat ini. Silakan coba lagi nanti.'
              : 'Asisten AI butuh server Finora untuk aktif. Di hosting statis, fitur pencatatan lain tetap berjalan normal.'),
        );
      }

      appendAiMessages([
        {
          id: generateEntityId('msg'),
          role: 'assistant',
          content: data.reply,
          periodLabel: data.periodLabel || periodRange.label,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Layanan AI sedang tidak tersedia. Fitur pencatatan Anda tetap aman.';
      setErrorBanner(msg);
      showToast('warning', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Financial Assistant"
        description="Jawaban disusun berdasarkan ringkasan angka terverifikasi dari buku besar Finora."
        actions={
          <>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as PeriodPreset)}
              aria-label="Periode acuan AI"
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-[#E8E9F1] bg-white text-xs font-medium text-[#202238]"
            >
              <option value="this_month">Acuan: Bulan Ini</option>
              <option value="last_month">Acuan: Bulan Lalu</option>
              <option value="7d">Acuan: 7 Hari Terakhir</option>
              <option value="this_year">Acuan: Tahun Ini</option>
            </select>

            {state.aiHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="min-h-[44px] px-3 py-1.5 rounded-xl border border-[#E8E9F1] bg-white hover:bg-[#FFF0F3] text-xs font-medium text-[#E65378] inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Riwayat
              </button>
            )}
          </>
        }
      />

      {/* Privacy Consent Strip */}
      <div className="bg-white border border-[#E8E9F1] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 text-xs text-[#74778B]">
          <ShieldCheck className="w-4 h-4 text-[#16A779] shrink-0 mt-0.5" />
          <span>
            Hanya ringkasan angka agregat periode ({periodRange.label}) yang dikirim saat Anda
            bertanya. File bukti struk tidak dikirim ke model AI.
          </span>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-medium text-[#202238] cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={state.preferences.aiConsentEnabled}
            onChange={(e) => updatePreferences({ aiConsentEnabled: e.target.checked })}
            className="w-4 h-4 accent-[#6655D9]"
          />
          Izinkan Analisis AI
        </label>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-[#E8E9F1] rounded-2xl flex flex-col min-h-[420px] max-h-[68dvh]">
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {state.aiHistory.length === 0 ? (
            <div className="py-6 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0EDFF] text-[#6655D9] flex items-center justify-center mx-auto">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#202238]">
                  Tanyakan Kondisi Keuangan Anda
                </h2>
                <p className="text-xs sm:text-sm text-[#74778B] mt-1">
                  Pilih salah satu pertanyaan di bawah atau ketik pertanyaan Anda sendiri untuk
                  periode <strong>{periodRange.label}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                {STARTER_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={loading}
                    onClick={() => sendQuestion(q)}
                    className="p-3 rounded-xl border border-[#E8E9F1] hover:border-[#6655D9]/50 hover:bg-[#F0EDFF]/40 text-xs text-[#202238] leading-relaxed transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            state.aiHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#6655D9] text-white'
                      : 'bg-[#F6F7FB] border border-[#E8E9F1] text-[#202238]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <p
                    className={`mt-2 text-[11px] ${
                      msg.role === 'user' ? 'text-white/75' : 'text-[#74778B]'
                    }`}
                  >
                    {msg.periodLabel ? `${msg.periodLabel} · ` : ''}
                    {formatDateID(msg.createdAt, true)}
                  </p>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#F6F7FB] border border-[#E8E9F1] rounded-2xl px-4 py-3 text-xs text-[#74778B]">
                Menyusun ringkasan data dan analisis untuk {periodRange.label}...
              </div>
            </div>
          )}
        </div>

        {errorBanner && (
          <div
            role="alert"
            className="mx-4 mb-2 px-3.5 py-2.5 rounded-xl bg-[#FFF0F3] border border-[#E65378]/30 text-xs text-[#E65378] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 border-t border-[#E8E9F1] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan pengeluaran, anggaran, atau estimasi tabungan..."
            disabled={loading}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-[#E8E9F1] text-sm text-[#202238] focus:outline-none focus:border-[#6655D9]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-[#6655D9] hover:bg-[#4938B5] disabled:opacity-50 text-white inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors shrink-0"
            aria-label="Kirim pertanyaan"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Hapus Riwayat Percakapan AI?"
        description="Seluruh riwayat percakapan asisten akan dihapus dari penyimpanan lokal. Data transaksi dan saldo Anda tidak berubah."
        confirmLabel="Hapus Riwayat"
        destructive
        onConfirm={() => {
          clearAiHistory();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
}
