# Finora — Smart Personal Finance

Aplikasi keuangan pribadi berbahasa Indonesia: saldo rekening & e-wallet, pencatatan
transaksi, anggaran, target tabungan, impor mutasi CSV, analisis, dan Asisten AI.

Dibangun dengan React 19 + Vite 8 + Tailwind CSS 4 (TypeScript).

## Menjalankan secara lokal

**Prasyarat:** Node.js 20.19+ atau 22.12+ (disarankan Node 22).

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000`. Dev server menjalankan `server.ts` (Express + Vite
middleware), jadi endpoint `/api/ai/chat` ikut aktif bila `GEMINI_API_KEY` tersedia
di `.env`.

Perintah lain:

```bash
npm run lint     # pemeriksaan tipe (tsc --noEmit)
npm run build    # build statis ke dist/
npm run preview  # pratinjau hasil build
```

## Deploy ke GitHub Pages

Build statis (folder `dist/`) otomatis dipublikasikan oleh
`.github/workflows/deploy.yml` setiap kali branch `main` menerima push.

1. Buat repository kosong di GitHub (jangan centang "Add a README").
2. Push proyek ini ke repository tersebut (lihat perintah di bawah).
3. Buka **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   Workflow juga mencoba mengaktifkannya otomatis.
4. Setelah workflow `Deploy Finora to GitHub Pages` selesai, situs tersedia di
   `https://<username>.github.io/<repo>/`.

`vite.config.ts` memakai `base: './'` sehingga build dapat dipasang di root domain
maupun sub-folder tanpa perubahan. Untuk hosting dengan prefix absolut, set
`VITE_BASE` saat build, misalnya `VITE_BASE=/finora/ npm run build`.

### Catatan hosting statis

- Seluruh data transaksi disimpan di `localStorage` browser (tanpa backend).
- Navigasi memakai hash route (`#/transaksi`, `#/akun`, …), jadi deep link dan
  refresh tetap aman di GitHub Pages.
- Asisten AI memanggil `/api/ai/chat` yang hanya ada saat `server.ts` berjalan.
  Di GitHub Pages endpoint itu tidak tersedia, sehingga panel AI akan menampilkan
  pesan bahwa layanan belum aktif; fitur pencatatan lain tetap berjalan normal.

## Struktur singkat

```
src/
  App.tsx                  shell aplikasi: routing, layout, modal
  components/layout/       sidebar, top bar, bottom nav, drawer
  components/ui/           PageHeader, AppModal, komponen dasar lain
  hooks/                   useAppRoute (hash router), useDialogA11y
  views/                   Beranda, Transaksi, Akun, Anggaran, Tabungan,
                           Analisis, Asisten AI, Pengaturan
  types/navigation.ts      metadata navigasi (urutan menu, rute, ikon)
server.ts                  Express + endpoint AI (dev & self-host)
```
