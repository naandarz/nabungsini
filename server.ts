import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatRequestBody {
  message?: string;
  history?: ChatHistoryItem[];
  periodLabel?: string;
  financialSummary?: Record<string, unknown>;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'finora-api' });
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const body = req.body as AiChatRequestBody;
      const userMessage = body?.message?.trim();
      const periodLabel = body?.periodLabel?.trim() || 'Periode aktif';
      const financialSummary = body?.financialSummary;

      if (!userMessage) {
        res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
        return;
      }

      if (!financialSummary || typeof financialSummary !== 'object') {
        res.status(400).json({ error: 'Ringkasan data keuangan tidak tersedia untuk dianalisis.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Layanan AI belum aktif karena konfigurasi API key belum tersedia. Fitur pencatatan keuangan Anda tetap berjalan normal.',
        });
        return;
      }

      const recentHistory = Array.isArray(body.history)
        ? body.history.slice(-6).map((item) => ({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(item.content || '').slice(0, 2000) }],
          }))
        : [];

      const systemInstruction = [
        'Anda adalah Asisten Keuangan Finora untuk pengguna individu di Indonesia.',
        'Aturan ketat yang WAJIB dipatuhi:',
        '1. Gunakan HANYA angka dan fakta dari objek "Ringkasan Keuangan Terverifikasi" yang diberikan. Jangan mengarang transaksi, saldo, kategori, atau perhitungan baru di luar data tersebut.',
        '2. Selalu sebutkan periode data acuan secara eksplisit pada awal atau bagian relevan jawaban.',
        '3. Jelaskan alasan di balik setiap pengamatan atau saran penghematan secara transparan dan praktis.',
        '4. Jika data kosong atau belum cukup untuk menjawab pertanyaan perbandingan/tren, nyatakan keterbatasan data dengan jujur.',
        '5. Gunakan bahasa Indonesia yang ramah, jelas, tidak menghakimi (jangan melabeli pengguna boros), dan jangan pernah memberikan janji keuntungan investasi atau saran berisiko.',
        '6. Format jawaban ringkas, rapi, gunakan poin seperlunya agar mudah dibaca di layar ponsel maupun desktop, dan tulis nominal Rupiah secara konsisten (mis. Rp1.250.000).',
      ].join('\n');

      const contextPrompt = `Ringkasan Keuangan Terverifikasi (Periode acuan: ${periodLabel}):\n${JSON.stringify(
        financialSummary,
        null,
        2,
      )}\n\nPertanyaan pengguna: ${userMessage}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [
          ...recentHistory,
          {
            role: 'user',
            parts: [{ text: contextPrompt }],
          },
        ],
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({
          error: 'Asisten AI tidak mengembalikan jawaban. Silakan coba beberapa saat lagi.',
        });
        return;
      }

      res.json({
        reply: replyText,
        periodLabel,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi gangguan pada layanan AI.';
      console.error('AI Financial Assistant error:', message);
      res.status(500).json({
        error:
          'Maaf, layanan AI sedang mengalami gangguan sementara. Data keuangan dan pencatatan Anda tetap aman dan dapat digunakan.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Finora server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
