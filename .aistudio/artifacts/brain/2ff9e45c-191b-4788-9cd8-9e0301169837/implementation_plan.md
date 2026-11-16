# Finora — Smart Personal Finance Management

Finora adalah aplikasi web pengelolaan keuangan pribadi berbahasa Indonesia dengan mata uang Rupiah (IDR) yang responsif untuk desktop, tablet, dan ponsel. Aplikasi ini menggabungkan pencatatan akun, transaksi lengkap dengan ID permanen dan lampiran bukti, transfer antar-akun, anggaran, target tabungan, impor/ekspor CSV, serta AI Financial Assistant berbasis data terverifikasi.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan utama berikut telah dikonfirmasi pada tahap klarifikasi dan menjadi landasan desain sistem serta antarmuka Finora.

- **Penyimpanan Data & Akses**: Data keuangan disimpan secara lokal di browser (`localStorage` untuk buku besar dan konfigurasi, serta penyimpanan lokal terstruktur untuk lampiran bukti) tanpa kewajiban login, disertai fitur ekspor/impor cadangan JSON agar pengguna tetap memegang kendali penuh atas datanya.
- **Cakupan Fitur**: Mencakup seluruh **MVP Core** (Dashboard, Akun & Rekonsiliasi, Transaksi & Lampiran Bukti, Transfer Internal, Anggaran, Target Tabungan, Analisis Grafik), ditambah **Impor/Ekspor CSV** dan **AI Financial Assistant** (menggunakan `@google/genai` melalui server Express).
- **Aturan Saldo Negatif**: Pengeluaran atau transfer yang melebihi saldo akun saat ini **diizinkan** dengan **peringatan yang jelas** (ikon dan teks peringatan eksplisit pada formulir serta kartu akun, bukan sekadar warna).
- **Pengalaman Awal (First Visit)**: Aplikasi dimulai dalam kondisi **kosong yang jujur** (*empty state* dengan panduan langkah pertama), dilengkapi tombol opsional **"Muat Data Contoh"** agar pengguna dapat langsung mencoba seluruh fitur dengan skenario Rupiah yang realistis.

---

## 1. Overview & Core Concept

- **What It Does**: Pusat kendali keuangan pribadi yang mencatat pemasukan, pengeluaran, transfer antar-rekening, penyesuaian saldo, anggaran per kategori, dan target tabungan dalam satu antarmuka responsif lintas perangkat, lalu mengolahnya menjadi grafik arus kas, ringkasan periode, dan konsultasi AI yang selalu merujuk angka nyata hasil perhitungan sistem.
- **Target Audience / Persona**: Individu di Indonesia (mahasiswa, pekerja, dan *freelancer*) yang mengelola uang di beberapa rekening bank, e-wallet, dan uang tunai melalui ponsel maupun komputer.
- **Key Value**: Menggantikan catatan tersebar dengan satu pembukuan akurat (transfer internal tidak menggandakan pengeluaran/pemasukan, target tabungan tidak menggandakan total saldo), lengkap dengan penelusuran ID transaksi, bukti struk/foto, impor mutasi CSV, dan asisten AI yang menjelaskan angka secara transparan.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Mulai & Orientasi**: Pengguna membuka Finora → melihat ringkasan kosong yang jelas dengan tombol *"Tambah Akun Pertama"* atau *"Muat Data Contoh"* → dapat langsung memilih mata uang/preferensi tampilan di Pengaturan.
  2. **Kelola Akun & Rekonsiliasi**: Pengguna membuat akun manual (Bank, E-Wallet, Tunai, Tabungan) dengan saldo awal → melihat saldo terhitung otomatis → melakukan rekonsiliasi saldo aktual dengan catatan alasan penyesuaian.
  3. **Catat & Telusuri Transaksi**: Pengguna menekan *"Tambah Transaksi"* (di header desktop atau tombol tengah bottom bar mobile) → memilih Pemasukan, Pengeluaran, atau Transfer → mengisi nominal Rupiah, akun, kategori, tanggal, catatan, dan opsional unggah/ambil foto bukti struk → sistem menerbitkan ID unik permanen (`FIN-...`) dan memperbarui saldo secara atomik. Klik baris/kartu transaksi membuka panel detail dengan tombol salin ID, pratinjau lampiran, metadata sumber (`Manual` / `Impor CSV`), serta aksi edit/hapus.
  4. **Anggaran & Target Tabungan**: Pengguna menetapkan batas anggaran kategori beserta ambang peringatan (mis. 70%, 85%, 100%) dan melihat realisasi pengeluaran murni (tanpa transfer). Pada Target Tabungan, pengguna mencatat kontribusi atau penarikan sambil menjaga aturan bahwa alokasi target tidak menggandakan total saldo akun.
  5. **Impor & Ekspor CSV**: Pengguna mengunggah file CSV mutasi → memetakan kolom (Tanggal, Deskripsi, Nominal/Debit/Kredit, Tipe) → meninjau pratinjau baris valid, invalid, dan deteksi duplikasi → mengonfirmasi impor. Ekspor tersedia dalam format CSV transaksi maupun cadangan JSON lengkap.
  6. **Analisis & AI Financial Assistant**: Pengguna melihat grafik arus kas dan distribusi kategori sesuai filter periode/akun, lalu bertanya kepada Asisten AI (mis. *"Bandingkan pengeluaran makan bulan ini dan bulan lalu"*). Sistem menghitung ringkasan metrik terlebih dahulu di lapisan analitik, mengirim ringkasan teragregasi ke endpoint backend Gemini, dan menampilkan jawaban beserta periode acuan.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Bersih, tenang, modern, dan terstruktur—mengadopsi tata letak sidebar + grid analitik dari referensi dashboard desktop dan kartu saldo utama + aksi cepat + navigasi jempol dari referensi mobile.
  - *Color Palette & Mood (Disiplin 60-30-10)*:
    - **60% Kanvas Netral**: `--background: #F6F7FB` (latar lembut sejuk yang nyaman dibaca lama).
    - **30% Permukaan Struktural**: `--surface: #FFFFFF` dengan garis pemisah halus 1px (`--border: #E8E9F1`), teks utama `--text-primary: #202238`, dan teks sekunder `--text-secondary: #74778B`.
    - **10% Aksen Utama**: `--primary: #6655D9` dan `--primary-hover: #4938B5` khusus untuk tombol aksi utama, indikator navigasi aktif, dan fokus kontrol.
    - **Warna Semantik Data (selalu berpasangan dengan teks/ikon)**: Pemasukan `--income: #16A779` (`+Rp`), Pengeluaran `--expense: #E65378` (`−Rp`), Transfer `--info: #3989D8` (`Transfer`), Peringatan/Saldo Negatif `--warning: #E5A13A` dan `--danger: #DC2626`.
  - *Typography & Hierarchy*:
    - **Display & UI**: `Plus Jakarta Sans` (bobot 500–700 untuk judul 24–30px dan angka saldo utama 28–36px, bobot 400–500 untuk isi 14–16px).
    - **Data & Angka Tabular**: `JetBrains Mono` dengan `tabular-nums` untuk seluruh nominal Rupiah (`Rp1.250.000`), tanggal ledger, dan ID transaksi agar kolom angka sejajar presisi.
  - *Component Styling & Responsive Layout*:
    - **Desktop (`>= 1024px`)**: Sidebar kiri tetap (dapat diciutkan, lebar `240px`), header satu baris yang bersih, dan grid 2–3 kolom penuh pada layar lebar (`1440px`). Tabel transaksi padat dan terstruktur.
    - **Tablet (`768px – 1023px`)**: Sidebar beralih menjadi drawer geser atau rail ringkas, grid 2 kolom.
    - **Mobile (`< 768px`)**: Header atas ringkas (`<= 56px`), Kartu Saldo Total yang menonjol (dengan tombol sembunyikan/tampilkan nominal), baris 4 Tombol Aksi Cepat, daftar transaksi berbentuk kartu sentuh (`min-height >= 56px`, target sentuh semua kontrol `>= 44px`), form transaksi berupa *bottom sheet* penuh kenyamanan jempol, dan *Bottom Tab Bar* (`Beranda`, `Transaksi`, tombol `+` tengah, `Analisis`, `Menu` untuk mengakses Akun, Anggaran, Target, Impor/Ekspor, AI Assistant, dan Pengaturan). Tinggi gabungan elemen sticky di mobile dijaga `<= 15%` tinggi layar.
    - **Disiplin Anti-Slop**: Tanpa kapsul/pill statis untuk metadata (gunakan teks bersih berpemisah `·`), tanpa kartu bersarang di dalam kartu, tanpa garis aksen tebal di sisi kiri (`border-l-4`), dan tanpa titik status berdenyut dekoratif.

- **Interactive Feedback & Motion**:
  - Transisi halus `<= 200ms` berbasis `transform` dan `opacity` (menghormati `prefers-reduced-motion`).
  - Setiap modul memiliki kondisi lengkap: *Loading* (skeleton selaras ukuran), *Empty* (penjelasan ramah + aksi pertama), *Validation Error* (dekat field terkait), *Confirmation Dialog* (untuk aksi hapus/reset), dan *Toast* umpan balik singkat.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Mesin Pembukuan Lokal Berbasis Integer Rupiah**
  - *Chosen Approach*: Seluruh perhitungan saldo, transfer, anggaran, dan target dijalankan melalui satu *Finance Engine* terpusat menggunakan bilangan bulat Rupiah (`integer`), bukan *floating point*, dan disimpan di browser (`localStorage` + penyimpanan lokal aman untuk lampiran bukti).
  - *Why*: Menjamin keakuratan mutlak (`Rp1.000` tidak pernah meleset menjadi `999.9999`), transfer antar-akun selalu atomik (debit sumber = kredit tujuan), dan aplikasi bekerja instan tanpa hambatan pendaftaran.
  - *Trade-Off*: Data terikat pada browser/perangkat saat ini; dimitigasi dengan fitur **Ekspor/Impor Cadangan JSON** dan **Ekspor CSV** agar pengguna bisa memindahkan data antarperangkat kapan saja.

- **Decision 2: Arsitektur Full-Stack Hybrid (Client Finance Ledger + Express Gemini Proxy)**
  - *Chosen Approach*: Menjalankan server Express (`server.ts` pada port `3000` bersama Vite middleware) yang khusus menangani endpoint `/api/ai/chat` menggunakan SDK `@google/genai` (`gemini-4-hydrogen`), sementara data transaksi tetap di browser.
  - *Why*: Menjaga `GEMINI_API_KEY` tetap berada di sisi server sesuai standar keamanan, sekaligus memastikan kegagalan AI tidak pernah memengaruhi pencatatan transaksi maupun perhitungan saldo.
  - *Trade-Off*: Saat pengguna bertanya ke Asisten AI, frontend menghitung ringkasan metrik terverifikasi (pemasukan, pengeluaran, kategori, anggaran, target, perbandingan bulan lalu) lalu mengirimkan **ringkasan teragregasi** tersebut ke server—bukan mengirim mentah seluruh database atau membiarkan LLM menghitung saldo sendiri.

- **Decision 3: Kebijakan Saldo Negatif & Penelusuran Bukti**
  - *Chosen Approach*: Mengizinkan transaksi yang membuat saldo akun menjadi negatif dengan menampilkan badge/peringatan teks + ikon yang tegas pada pratinjau form dan kartu akun; setiap transaksi menerbitkan ID permanen `FIN-XXXX-XXXX` yang tidak berubah saat diedit dan mendukung lampiran gambar/PDF (dikompresi otomatis bila gambar besar agar hemat ruang lokal).
  - *Why*: Pencatatan pribadi sering mencatat transaksi tertunda atau koreksi sebelum pemasukan dicatat; memblokir secara kaku dapat menghambat pencatatan, sementara peringatan jelas menjaga kesadaran pengguna.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (React + TypeScript)                      │
│                                                                           │
│  ┌──────────────────────┐    ┌─────────────────────────────────────────┐  │
│  │  Responsive Shell    │    │           Finance Store & Engine        │  │
│  │  • Desktop Sidebar   │◄──►│  • Accounts & Reconciliation            │  │
│  │  • Mobile Bottom Nav │    │  • Transactions, Transfers & Attachments│  │
│  │  • Sheet / Modals    │    │  • Budgets & Threshold Evaluator        │  │
│  └──────────┬───────────┘    │  • Savings Goals & Estimates            │  │
│             │                │  • Analytics Aggregator & CSV Engine    │  │
│             ▼                └────────────────────┬────────────────────┘  │
│  ┌──────────────────────┐                         │                       │
│  │  Feature Views       │                         ▼                       │
│  │  • Dashboard         │            ┌─────────────────────────┐          │
│  │  • Transaksi & Detail│            │  Local Persistence      │          │
│  │  • Akun & Rekening   │            │  • localStorage (Ledger)│          │
│  │  • Anggaran & Target │            │  • IndexedDB (Bukti/Img)│          │
│  │  • Analisis & CSV    │            └─────────────────────────┘          │
│  │  • AI Assistant      │                         │                       │
│  └──────────┬───────────┘                         │ Ringkasan Metrik      │
└─────────────┼─────────────────────────────────────┼───────────────────────┘
              │ POST /api/ai/chat (konteks teragregasi)
              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER (server.ts :3000)                     │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  AI Financial Orchestrator                                          │  │
│  │  • Validasi payload & batas konteks                                 │  │
│  │  • @google/genai (model: gemini-4-hydrogen)                         │  │
│  │  • System instruction: gunakan angka terverifikasi, sebut periode,  │  │
│  │    nyatakan keterbatasan jika data kurang, tanpa janji investasi    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `Account`: `id`, `name`, `type` (`bank` | `ewallet` | `cash` | `savings` | `other`), `institution`, `openingBalance`, `includeInTotal`, `isArchived`, `createdAt`, `updatedAt`. Saldo terkini selalu dihitung konsisten dari `openingBalance + income + transferIn - expense - transferOut + adjustment`.
  - `Transaction`: `id` (permanen `FIN-...`), `type` (`income` | `expense` | `transfer` | `adjustment`), `amount` (integer > 0), `date`, `accountId`, `destinationAccountId` (khusus transfer), `transferGroupId`, `categoryId`, `description`, `note`, `source` (`manual` | `import` | `system`), `status` (`tercatat` | `perlu_ditinjau`), `attachmentIds`, `createdAt`, `updatedAt`.
  - `Attachment`: Disimpan di IndexedDB (`id`, `transactionId`, `fileName`, `mimeType`, `size`, `dataBlobOrUrl`, `uploadedAt`) agar foto struk beresolusi baik tidak cepat memenuhi kuota `localStorage`.
  - `Category`: Kategori bawaan Indonesia (Makan & Minum, Transportasi, Belanja, Tagihan & Utilitas, Kesehatan, Hiburan, Gaji, Bonus, Freelance, Penyesuaian) + kategori kustom pengguna.
  - `Budget`: `id`, `categoryId`, `monthKey` (`YYYY-MM`), `limitAmount`, `alertThresholds` (`[70, 85, 100]`).
  - `SavingsGoal`: `id`, `name`, `targetAmount`, `targetDate`, `priority`, `status` (`active` | `achieved` | `paused`), `description`, serta riwayat `contributions` (`deposit` | `withdraw`, opsional terhubung ke ID transaksi/transfer agar tidak dihitung ganda).
  - `UserPreferences`: `hideBalances`, `currency` (`IDR`), `locale` (`id-ID`), `aiConsentEnabled`, `aiChatHistory`.

- **Interactive Component & State Mapping**:
  - **Quick Transaction Form (Modal/Bottom Sheet)**: Validasi real-time nominal > 0, akun asal ≠ akun tujuan untuk transfer, pratinjau peringatan saldo negatif sebelum simpan, kompresi & pratinjau lampiran foto/PDF, serta pembaruan atomik ke `FinanceContext`.
  - **Transaction List & Detail Panel**: Pencarian instan (deskripsi, catatan, kategori, ID), filter gabungan (jenis, akun, kategori, rentang tanggal), penyortiran, klik baris untuk membuka Detail Panel dengan fitur salin ID `FIN-...`, ganti/unduh/hapus lampiran, edit, dan konfirmasi hapus.
  - **CSV Import Wizard**: 3 langkah (Unggah & pilih akun tujuan → Pemetaan kolom otomatis/manual + pratinjau → Validasi & deteksi duplikasi berdasarkan tanggal + nominal + deskripsi → Konfirmasi impor).
  - **AI Assistant View**: Menyediakan pertanyaan cepat siap klik, toggle izin akses ringkasan data keuangan, pengiriman ringkasan metrik periode aktif ke `POST /api/ai/chat`, status loading yang jelas, dan fallback pesan informatif apabila layanan AI sedang tidak tersedia.

- **Key Sequences & Integrations**:
  - *Server AI Endpoint*: `POST /api/ai/chat` memanggil `GoogleGenAI` (`gemini-4-hydrogen`) dengan `systemInstruction` ketat berbahasa Indonesia agar model hanya menginterpretasikan angka yang dikirim oleh Finance Analytics Engine, mencantumkan rentang tanggal acuan, dan tidak pernah mengarang angka atau memberikan rekomendasi investasi berisiko.
  - *Client-Server Separation*: `@google/genai` hanya diimpor di `server.ts`; frontend berkomunikasi via `fetch('/api/ai/chat')` sehingga aplikasi tetap berfungsi penuh secara offline/lokal untuk semua fitur keuangan inti meskipun panggilan AI gagal.
