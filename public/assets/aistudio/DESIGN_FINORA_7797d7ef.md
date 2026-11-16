# DESIGN_FINORA.md
## UI/UX Design Specification — Finora

**Versi:** 1.0  
**Status:** Draft implementasi  
**Dokumen terkait:** `PRD_FINORA.md`, `FLOW_FINORA.md`  
**Tujuan:** Menjadi acuan visual dan perilaku antarmuka Finora agar implementasi desktop dan mobile konsisten.

---

## 1. Arah Desain

Finora adalah aplikasi pengelolaan keuangan pribadi. Antarmuka harus terasa modern, ringan, mudah dipahami, dan membantu pengguna mengetahui kondisi keuangannya tanpa harus membaca terlalu banyak informasi.

### 1.1 Referensi visual

Dokumen ini menggunakan dua gambar referensi yang diberikan:

1. **Referensi dashboard desktop** — menggunakan sidebar vertikal, area konten utama yang luas, kartu dengan sudut membulat, kalender/agenda di sisi kiri, serta panel aktivitas di sisi kanan. Finora mengadaptasi komposisi dan kerapian layout tersebut untuk informasi keuangan.
2. **Referensi aplikasi keuangan mobile** — menggunakan ringkasan saldo yang menonjol, tombol aksi cepat, grafik analisis, daftar transaksi, dan target keuangan. Pola ini menjadi acuan utama untuk pengalaman mobile Finora.

Referensi digunakan sebagai inspirasi tata letak dan hierarki visual, bukan untuk menyalin identitas atau elemen secara persis.

### 1.2 Prinsip desain

- **Informasi penting lebih dahulu:** saldo, arus kas, pengeluaran, dan kondisi anggaran harus mudah ditemukan.
- **Riwayat dapat ditelusuri:** setiap transaksi mempunyai identitas unik dan detail sumber data.
- **Bukti transaksi mudah dilampirkan:** pengguna dapat menambahkan foto struk, kuitansi, atau bukti pembayaran.
- **Visualisasi tidak menyesatkan:** grafik harus memiliki periode, satuan, dan keterangan yang jelas.
- **Input sederhana:** formulir transaksi tidak boleh terasa seperti formulir akuntansi yang rumit.
- **Responsif:** fungsi utama tetap nyaman digunakan di layar ponsel.
- **Aksesibel:** teks terbaca, kontras cukup, status tidak hanya dibedakan dengan warna.

---

## 2. Identitas Visual

### 2.1 Karakter visual

- Modern, bersih, ramah, dan profesional.
- Menggunakan kartu dengan radius sedang hingga besar.
- Menggunakan ruang kosong yang cukup agar data tidak terasa padat.
- Warna aksen digunakan untuk membantu membedakan jenis informasi, bukan sekadar dekorasi.
- Hindari terlalu banyak gradien, bayangan tebal, dan warna neon.

### 2.2 Palet warna awal

Palet berikut merupakan usulan awal yang dapat disesuaikan saat implementasi desain.

| Token | Warna | Penggunaan |
|---|---|---|
| `primary` | `#6655D9` | Tombol utama, navigasi aktif, tautan penting |
| `primary-dark` | `#4938B5` | Hover/pressed dan aksen kuat |
| `primary-soft` | `#F0EDFF` | Latar elemen aktif dan chip |
| `background` | `#F6F7FB` | Latar halaman |
| `surface` | `#FFFFFF` | Kartu dan panel |
| `text-primary` | `#202238` | Judul dan teks utama |
| `text-secondary` | `#74778B` | Deskripsi dan metadata |
| `border` | `#E8E9F1` | Garis pembatas |
| `income` | `#16A779` | Pemasukan |
| `income-soft` | `#E8F8F1` | Latar pemasukan |
| `expense` | `#E65378` | Pengeluaran |
| `expense-soft` | `#FFF0F3` | Latar pengeluaran |
| `warning` | `#E5A13A` | Peringatan anggaran |
| `info` | `#3989D8` | Informasi dan status sinkronisasi |
| `neutral` | `#8B8EA3` | Transfer, kategori umum, metadata |

**Aturan warna transaksi:**
- Pemasukan: hijau dan awalan `+`.
- Pengeluaran: merah/merah muda dan awalan `−`.
- Transfer: netral/biru dan label `Transfer`; jangan dihitung sebagai pemasukan atau pengeluaran.
- Status tidak boleh hanya ditandai dengan warna. Sertakan teks atau ikon.

### 2.3 Tipografi

Gunakan font sans-serif yang mudah dibaca, misalnya Inter, Plus Jakarta Sans, atau font sistem yang setara.

| Elemen | Rekomendasi |
|---|---|
| Judul halaman | 24–30 px, semibold |
| Judul bagian | 16–20 px, semibold |
| Angka saldo utama | 28–36 px, bold |
| Angka pada kartu | 20–24 px, semibold |
| Isi | 14–16 px, regular |
| Metadata | 12–13 px, regular |

Gunakan angka tabular untuk nominal agar posisi digit stabil saat dibandingkan.

### 2.4 Bentuk dan elevasi

- Kartu utama: radius 18–24 px.
- Input dan tombol: radius 10–14 px.
- Chip/status: radius penuh.
- Border tipis lebih diutamakan daripada shadow besar.
- Shadow hanya digunakan untuk membedakan lapisan, misalnya dropdown atau dialog.

---

## 3. Struktur Navigasi

### 3.1 Navigasi desktop

Gunakan sidebar di sisi kiri dan area konten di kanan.

Urutan menu yang disarankan:

1. Dashboard
2. Transaksi
3. Akun
4. Anggaran
5. Target Tabungan
6. Analisis
7. Laporan
8. Asisten AI
9. Pengaturan

Sidebar dapat memiliki:
- Logo dan nama Finora di bagian atas.
- Menu dengan ikon dan label.
- Penanda menu aktif.
- Profil pengguna di bagian bawah.
- Tombol collapse untuk memperluas ruang konten.

### 3.2 Navigasi mobile

Gunakan bottom navigation untuk halaman yang paling sering digunakan:

- Beranda
- Transaksi
- Tombol tambah transaksi (aksi utama di tengah)
- Analisis
- Profil

Menu sekunder seperti akun, anggaran, target tabungan, laporan, dan pengaturan dapat diakses dari halaman Profil/Menu.

Pastikan tombol tambah tidak menutupi konten atau sistem navigasi perangkat.

---

## 4. Dashboard

### 4.1 Tujuan

Dashboard memberi gambaran cepat tentang kondisi keuangan pada periode yang dipilih.

### 4.2 Layout desktop

Adaptasi dari referensi desktop:
- Sidebar tetap di kiri.
- Header halaman berisi sapaan, tanggal/periode, notifikasi, dan profil.
- Baris ringkasan keuangan di bagian atas.
- Area utama dibagi menjadi beberapa panel dengan hierarki yang jelas.
- Panel kalender/aktivitas dapat digunakan sebagai tampilan arus kas per tanggal, bukan kalender olahraga seperti pada referensi.

Susunan yang disarankan:

1. Header: `Dashboard`, pemilih periode, notifikasi.
2. Kartu ringkasan: total saldo, pemasukan, pengeluaran, sisa anggaran.
3. Grafik arus kas: pemasukan dan pengeluaran dalam periode tertentu.
4. Panel aktivitas/kalender keuangan: tanggal dengan indikator transaksi.
5. Transaksi terbaru: beberapa transaksi terakhir.
6. Ringkasan anggaran dan target tabungan.

### 4.3 Layout mobile

Adaptasi dari referensi aplikasi keuangan:
- Header ringkas dengan avatar/profil dan notifikasi.
- Kartu saldo total sebagai elemen paling menonjol.
- Tombol aksi cepat: Tambah Pemasukan, Tambah Pengeluaran, Transfer, Lihat Riwayat.
- Ringkasan pemasukan dan pengeluaran.
- Grafik mini atau ringkasan kategori.
- Daftar transaksi terbaru.
- Ringkasan target tabungan.

Pada layar kecil, prioritaskan saldo, aksi cepat, dan transaksi terbaru. Hindari menampilkan terlalu banyak grafik sekaligus.

### 4.4 Kartu saldo

Tampilkan:
- Label `Total Saldo`.
- Nominal total saldo dari seluruh akun yang disertakan.
- Tombol tampil/sembunyikan nominal.
- Perubahan dibanding periode sebelumnya hanya jika data pembanding tersedia.
- Keterangan waktu/periode perhitungan.

Jangan menampilkan persentase pertumbuhan jika sistem tidak memiliki data periode pembanding yang valid.

### 4.5 Empty state

Jika pengguna belum memiliki transaksi:
- Tampilkan penjelasan singkat bahwa ringkasan akan muncul setelah transaksi ditambahkan.
- Sediakan tombol `Tambah Transaksi`.
- Jangan menampilkan grafik dengan nilai palsu atau data contoh seolah-olah milik pengguna.

---

## 5. Halaman Transaksi dan Riwayat Keuangan

Halaman ini merupakan salah satu bagian terpenting Finora. Riwayat harus dapat diperiksa kembali dan setiap catatan harus memiliki identitas yang konsisten.

### 5.1 Daftar transaksi

Komponen:
- Judul `Riwayat Transaksi`.
- Tombol `Tambah Transaksi`.
- Pencarian berdasarkan nama, catatan, kategori, atau ID transaksi.
- Filter jenis: Semua, Pemasukan, Pengeluaran, Transfer.
- Filter akun, kategori, sumber data, dan rentang tanggal.
- Pengurutan terbaru/terlama dan nominal.
- Ringkasan total sesuai filter.
- Daftar transaksi berbentuk tabel pada desktop dan kartu/list pada mobile.

Informasi minimum per baris:
- Tanggal dan waktu.
- Nama/deskripsi transaksi.
- Kategori.
- Akun.
- Nominal dan jenis transaksi.
- Status bukti (ada/tidak ada lampiran).
- ID transaksi dapat dilihat melalui detail atau opsi salin.

### 5.2 Detail transaksi

Saat transaksi dibuka, tampilkan halaman detail atau panel samping yang memuat:

**Informasi utama**
- ID transaksi unik.
- Jenis transaksi.
- Nominal dan mata uang.
- Deskripsi.
- Kategori.
- Akun sumber.
- Akun tujuan untuk transfer.
- Tanggal dan waktu transaksi.

**Informasi pencatatan**
- Waktu data dibuat.
- Waktu terakhir diperbarui.
- Sumber pencatatan: manual, impor file, atau integrasi.
- Status pencatatan/validasi.
- Catatan tambahan.

**Bukti transaksi**
- Foto atau file bukti.
- Nama file.
- Waktu unggah.
- Pratinjau gambar.
- Aksi lihat, unduh, atau ganti lampiran sesuai izin.

### 5.3 ID transaksi

Setiap transaksi wajib memiliki ID internal yang unik dan tidak berubah selama transaksi tersebut ada.

Rekomendasi:
- Gunakan UUID atau ID unik setara yang dibuat oleh sistem.
- ID tidak boleh bergantung pada nomor urut tampilan.
- ID tidak boleh berubah saat transaksi diedit.
- ID ditampilkan pada halaman detail.
- Sediakan tombol salin ID.
- Jika transaksi berasal dari sumber eksternal, simpan `external_reference_id` secara terpisah. Jangan mengganti ID internal Finora dengan ID dari bank/platform.

Contoh tampilan:
- `ID Transaksi: FIN-7F3A-92D1`
- Contoh di atas hanya ilustrasi format tampilan, bukan format ID yang wajib digunakan.

### 5.4 Foto bukti transaksi

Pengguna dapat menambahkan satu atau beberapa lampiran sesuai batas yang ditentukan produk.

Format yang dapat dipertimbangkan:
- JPG/JPEG
- PNG
- WEBP
- PDF untuk kuitansi atau dokumen

Fitur:
- Ambil foto dari kamera perangkat jika didukung.
- Pilih foto/file dari perangkat.
- Pratinjau sebelum menyimpan.
- Hapus atau ganti lampiran.
- Tampilkan thumbnail pada detail transaksi.
- Tampilkan indikator lampiran pada daftar riwayat.
- Validasi tipe file dan ukuran maksimum.
- Kompresi gambar bila diperlukan tanpa membuat bukti sulit dibaca.

**Catatan privasi:** bukti transaksi dapat memuat nama, nomor rekening, alamat, atau informasi sensitif. Berikan kontrol akses yang jelas. Jangan membuat lampiran dapat diakses publik melalui URL terbuka. Jika penyimpanan cloud digunakan, gunakan akses privat dan URL sementara/terproteksi.

### 5.5 Form tambah transaksi

Form harus ringkas dan dikelompokkan:

1. Jenis transaksi: Pemasukan / Pengeluaran / Transfer.
2. Nominal.
3. Akun.
4. Kategori (tidak berlaku untuk transfer jika aturan produk memisahkannya).
5. Tanggal dan waktu.
6. Deskripsi.
7. Catatan opsional.
8. Foto/file bukti opsional.
9. Tombol simpan.

Untuk transfer, tampilkan akun asal dan akun tujuan serta pastikan keduanya berbeda.

Validasi:
- Nominal harus lebih besar dari nol.
- Akun wajib dipilih.
- Tanggal harus valid.
- Kategori wajib jika diwajibkan untuk pemasukan/pengeluaran.
- File harus memenuhi batas tipe dan ukuran.
- Tampilkan pesan kesalahan di dekat field terkait.

Setelah tersimpan:
- Tampilkan konfirmasi.
- Buat ID transaksi.
- Perbarui saldo dan ringkasan terkait.
- Catat sumber dan waktu pembuatan.
- Arahkan pengguna ke detail atau kembali ke riwayat sesuai aksi yang dipilih.

### 5.6 Riwayat yang dapat dipercaya

Untuk mengurangi risiko data keliru:
- Bedakan transaksi asli, transaksi hasil impor, dan transaksi yang disinkronkan.
- Simpan waktu pencatatan dan waktu transaksi secara terpisah.
- Tampilkan status jika transaksi belum tervalidasi atau perlu ditinjau.
- Deteksi kemungkinan duplikasi saat impor.
- Jangan menghapus jejak sumber transaksi ketika pengguna mengedit data.
- Perubahan penting dapat dicatat dalam riwayat perubahan/audit log.
- Jangan menyebut transaksi sebagai `terverifikasi bank` kecuali benar-benar berasal dari integrasi resmi yang mendukung status tersebut.
- Jangan menganggap foto bukti otomatis membuktikan bahwa transaksi sudah terjadi; foto adalah lampiran pendukung yang diunggah pengguna.

### 5.7 Status transaksi

Gunakan status yang memiliki makna jelas, misalnya:
- `Tercatat` — transaksi sudah tersimpan di Finora.
- `Perlu ditinjau` — data impor memiliki masalah atau perlu konfirmasi.
- `Tersinkronisasi` — data diterima dari koneksi resmi dan berhasil diproses.
- `Gagal disinkronkan` — proses sinkronisasi gagal.
- `Dibatalkan` — transaksi dibatalkan sesuai aturan aplikasi.

Jangan gunakan status `Terverifikasi` untuk transaksi manual hanya karena pengguna melampirkan foto.

---

## 6. Akun Keuangan

Tampilan akun berupa kartu yang menunjukkan:
- Nama akun.
- Jenis akun: tunai, bank, e-wallet, atau jenis lain yang didukung.
- Saldo saat ini.
- Mata uang.
- Status koneksi jika akun terhubung.
- Aksi lihat detail dan rekonsiliasi.

Halaman detail akun menampilkan:
- Saldo saat ini.
- Riwayat transaksi akun.
- Saldo awal.
- Tanggal pembukaan/pencatatan.
- Rekonsiliasi saldo.
- Pengaturan akun.

Jangan menggabungkan saldo mata uang berbeda tanpa konversi dan keterangan kurs yang jelas.

---

## 7. Anggaran

Tampilkan:
- Periode anggaran.
- Total batas anggaran.
- Total pengeluaran yang masuk perhitungan.
- Sisa anggaran.
- Progress bar.
- Daftar anggaran per kategori.

Status visual:
- Normal: penggunaan masih dalam batas aman.
- Mendekati batas: tampilkan peringatan.
- Melebihi batas: tampilkan jumlah kelebihan secara jelas.

Transfer antar akun tidak boleh dihitung sebagai pengeluaran anggaran.

---

## 8. Target Tabungan

Mengadaptasi kartu target pada referensi mobile.

Setiap kartu target menampilkan:
- Nama target.
- Ikon atau gambar ilustrasi.
- Nominal target.
- Dana terkumpul.
- Sisa dana.
- Persentase progress.
- Target tanggal jika ditentukan.

Halaman detail target:
- Deskripsi target.
- Riwayat kontribusi.
- Tambah kontribusi.
- Edit target.
- Status tercapai/aktif/ditunda.

**Aturan penting:** target tabungan adalah tujuan alokasi dana, bukan akun uang baru. Kontribusi target tidak boleh menggandakan total saldo atau dianggap sebagai pengeluaran konsumsi. Perpindahan dana antar akun tetap dicatat sesuai aturan transfer.

---

## 9. Analisis Keuangan

Gunakan visualisasi sederhana:
- Pemasukan vs pengeluaran.
- Pengeluaran berdasarkan kategori.
- Perbandingan bulanan.
- Tren saldo.
- Ringkasan anggaran.
- Perbandingan periode.

Setiap grafik harus memiliki:
- Judul yang spesifik.
- Rentang tanggal/periode.
- Satuan nominal.
- Label atau tooltip.
- Empty state jika data tidak cukup.

Jangan membuat kesimpulan tren dari periode yang datanya belum lengkap tanpa memberi penanda.

---

## 10. Laporan

Fitur:
- Pilih periode laporan.
- Pilih akun atau seluruh akun.
- Pilih jenis transaksi.
- Pratinjau ringkasan.
- Ekspor PDF/CSV sesuai kemampuan implementasi.

Laporan minimal memuat:
- Periode.
- Ringkasan pemasukan.
- Ringkasan pengeluaran.
- Arus kas bersih.
- Rincian kategori.
- Daftar transaksi.
- Tanggal pembuatan laporan.

Untuk transaksi yang memiliki lampiran, laporan dapat menampilkan indikator atau daftar referensi lampiran. Jangan memasukkan semua foto ke PDF secara otomatis karena dapat memperbesar ukuran file; sediakan opsi bila diperlukan.

---

## 11. Asisten AI

Tampilan percakapan sederhana dengan:
- Kolom input.
- Saran pertanyaan.
- Riwayat percakapan.
- Indikator ketika AI sedang memproses.
- Sumber/periode data yang digunakan untuk jawaban keuangan.

AI harus:
- Menggunakan data Finora yang telah diizinkan pengguna.
- Menyebutkan periode analisis.
- Memisahkan angka hasil perhitungan sistem dari interpretasi AI.
- Menyatakan jika data belum cukup.
- Tidak mengarang transaksi, saldo, atau kategori.
- Tidak mengklaim telah melakukan tindakan finansial.

---

## 12. Notifikasi dan Pengaturan

### Notifikasi
Gunakan daftar notifikasi dengan:
- Ikon jenis notifikasi.
- Judul singkat.
- Waktu.
- Status sudah dibaca/belum dibaca.
- Aksi menuju halaman terkait.

### Pengaturan
Kelompokkan pengaturan:
- Profil.
- Preferensi tampilan.
- Mata uang utama.
- Kategori.
- Keamanan.
- Privasi dan izin.
- Koneksi layanan.
- Ekspor data.
- Penghapusan akun.

---

## 13. Komponen UI yang Dapat Digunakan Ulang

Bangun komponen konsisten agar semua halaman tidak memiliki gaya berbeda.

| Komponen | Fungsi |
|---|---|
| `AppSidebar` | Navigasi desktop |
| `MobileBottomNav` | Navigasi mobile |
| `PageHeader` | Judul, deskripsi, aksi halaman |
| `BalanceCard` | Menampilkan saldo utama |
| `SummaryCard` | Menampilkan metrik ringkas |
| `QuickActionButton` | Aksi cepat |
| `TransactionList` | Daftar riwayat transaksi |
| `TransactionRow` | Baris transaksi desktop |
| `TransactionCard` | Kartu transaksi mobile |
| `TransactionTypeBadge` | Penanda pemasukan/pengeluaran/transfer |
| `TransactionIdField` | Menampilkan dan menyalin ID |
| `AttachmentUploader` | Unggah bukti transaksi |
| `AttachmentPreview` | Pratinjau lampiran |
| `PeriodFilter` | Filter periode |
| `CategoryBadge` | Penanda kategori |
| `BudgetProgress` | Progress anggaran |
| `GoalCard` | Kartu target tabungan |
| `ChartCard` | Wadah grafik |
| `EmptyState` | Tampilan data kosong |
| `LoadingSkeleton` | Placeholder saat memuat |
| `ConfirmDialog` | Konfirmasi tindakan penting |
| `Toast` | Umpan balik aksi |

Komponen harus menerima data melalui props dan tidak membuat data keuangan contoh secara permanen di dalam komponen produksi.

---

## 14. Responsivitas

### Desktop (≥ 1024 px)
- Sidebar terlihat.
- Dashboard dapat menggunakan grid dua atau tiga kolom.
- Tabel transaksi dapat menampilkan lebih banyak kolom.
- Form dapat ditampilkan dalam modal besar atau halaman khusus.

### Tablet (768–1023 px)
- Sidebar dapat diperkecil atau menjadi drawer.
- Grid dikurangi menjadi dua kolom.
- Tabel dapat disederhanakan.

### Mobile (< 768 px)
- Gunakan bottom navigation.
- Konten satu kolom.
- Tabel transaksi berubah menjadi kartu/list.
- Form menggunakan layar penuh atau bottom sheet yang nyaman.
- Tombol utama mudah dijangkau.
- Grafik harus dapat dibaca tanpa zoom horizontal.
- Lampiran dapat dipilih dari kamera atau galeri jika perangkat mendukung.

Jangan hanya mengecilkan layout desktop. Susun ulang prioritas konten untuk kebutuhan mobile.

---

## 15. State dan Umpan Balik UI

Setiap halaman yang mengambil data harus memiliki kondisi:

- **Loading:** gunakan skeleton atau indikator yang tidak menggeser layout secara drastis.
- **Empty:** jelaskan mengapa belum ada data dan berikan aksi berikutnya.
- **Success:** beri umpan balik setelah simpan, unggah, impor, atau ekspor.
- **Validation error:** tampilkan pesan dekat field.
- **Network/API error:** jelaskan bahwa data belum berhasil dimuat/disimpan dan sediakan coba lagi.
- **Permission error:** jelaskan jika pengguna tidak memiliki akses.
- **Upload error:** jelaskan tipe/ukuran file yang tidak sesuai.
- **Partial data:** tandai data yang belum lengkap atau belum tersinkronisasi.
- **Offline:** jangan mengklaim data sudah tersimpan di server jika proses sinkronisasi belum berhasil.

Untuk aksi hapus, tampilkan dialog konfirmasi. Untuk perubahan yang tidak dapat dibatalkan, jelaskan dampaknya.

---

## 16. Aksesibilitas dan Keamanan Tampilan

- Pastikan kontras teks dan latar memadai.
- Semua tombol ikon memiliki label aksesibel atau tooltip.
- Field memiliki label, bukan hanya placeholder.
- Fokus keyboard terlihat.
- Jangan membedakan pemasukan/pengeluaran hanya berdasarkan warna.
- Nominal saldo dapat disembunyikan.
- Informasi sensitif tidak ditampilkan pada notifikasi layar kunci secara default.
- Foto bukti transaksi hanya dapat dilihat oleh pengguna yang berwenang.
- Hindari menampilkan ID sensitif eksternal secara penuh jika tidak diperlukan.

---

## 17. Aturan Data untuk Tampilan Riwayat

Desain UI harus mendukung struktur data transaksi berikut. Ini adalah kebutuhan tampilan dan informasi; struktur database final ditentukan pada dokumen teknis.

| Field | Wajib | Keterangan |
|---|---:|---|
| `transaction_id` | Ya | ID internal unik dan permanen |
| `type` | Ya | income, expense, atau transfer |
| `amount` | Ya | Nominal transaksi |
| `currency` | Ya | Mata uang |
| `transaction_date` | Ya | Waktu transaksi terjadi |
| `description` | Ya | Nama/deskripsi transaksi |
| `account_id` | Ya | Akun yang terkait |
| `category_id` | Kondisional | Kategori untuk jenis yang relevan |
| `destination_account_id` | Kondisional | Akun tujuan untuk transfer |
| `note` | Tidak | Catatan tambahan |
| `attachments` | Tidak | Satu atau beberapa bukti foto/file |
| `source` | Ya | manual, import, atau integration |
| `external_reference_id` | Tidak | Referensi dari sumber eksternal |
| `record_status` | Ya | Status pencatatan/sinkronisasi |
| `created_at` | Ya | Waktu data dibuat |
| `updated_at` | Ya | Waktu data terakhir diubah |

### Aturan tampilan ID dan bukti

- ID internal dibuat otomatis oleh sistem.
- ID tetap sama meskipun deskripsi, kategori, atau nominal dikoreksi.
- Foto bukti disimpan sebagai lampiran terpisah yang terhubung ke ID transaksi.
- Satu transaksi dapat memiliki lebih dari satu lampiran.
- Menghapus lampiran tidak menghapus transaksi.
- Menghapus transaksi harus mengikuti konfirmasi dan kebijakan pemulihan/soft delete yang ditentukan produk.
- Untuk transaksi impor, simpan informasi file/batch impor agar sumber data dapat ditelusuri.
- Untuk transaksi integrasi, simpan nama penyedia dan referensi eksternal bila tersedia.

---

## 18. Prioritas Implementasi UI

### MVP
1. Design system dan layout responsif.
2. Sidebar desktop dan bottom navigation mobile.
3. Dashboard dengan saldo, pemasukan, pengeluaran, dan transaksi terbaru.
4. Daftar, tambah, edit, dan detail transaksi.
5. ID transaksi unik yang dapat disalin.
6. Unggah dan pratinjau foto/file bukti.
7. Akun keuangan.
8. Anggaran dan target tabungan dasar.
9. Analisis dasar.
10. Empty, loading, error, dan confirmation states.

### Tahap berikutnya
1. Impor CSV/XLSX dengan pratinjau dan validasi.
2. Laporan PDF/CSV.
3. Transaksi berulang.
4. Asisten AI.
5. Integrasi bank/e-wallet resmi jika tersedia dan layak.

---

## 19. Kriteria Penerimaan Desain

Desain dianggap siap diimplementasikan apabila:

- [ ] Dashboard desktop mengikuti struktur sidebar dan panel yang rapi.
- [ ] Dashboard mobile memiliki saldo utama, aksi cepat, grafik ringkas, dan transaksi terbaru.
- [ ] Pengguna dapat menemukan riwayat transaksi dan memfilter data.
- [ ] Setiap transaksi memiliki ID unik yang dapat dilihat dan disalin.
- [ ] Detail transaksi menampilkan sumber pencatatan dan waktu pencatatan.
- [ ] Pengguna dapat melampirkan dan melihat foto/file bukti.
- [ ] Lampiran tidak dapat diakses publik tanpa izin.
- [ ] Status transaksi memiliki label yang jelas dan tidak menyesatkan.
- [ ] Grafik menampilkan periode dan satuan.
- [ ] Tampilan kosong tidak menggunakan angka transaksi palsu.
- [ ] Semua fungsi utama nyaman digunakan di desktop dan mobile.
- [ ] Komponen loading, error, validasi, dan konfirmasi tersedia.

---

## 20. Instruksi untuk AI Coding Agent

Gunakan dokumen ini bersama `PRD_FINORA.md` dan `FLOW_FINORA.md`.

Sebelum melakukan implementasi:
1. Periksa struktur proyek yang sudah ada.
2. Cocokkan halaman dan fitur dengan PRD serta flow.
3. Buat design tokens dan komponen dasar terlebih dahulu.
4. Implementasikan layout desktop dan mobile secara responsif.
5. Prioritaskan alur transaksi dan riwayat keuangan.
6. Pastikan ID transaksi dan lampiran bukti menjadi bagian dari detail transaksi sejak awal, bukan tambahan visual tanpa dukungan data.
7. Jangan membuat data dummy seolah-olah merupakan data asli pengguna.
8. Jangan mengarang integrasi bank, status verifikasi, atau hasil analisis.
9. Jika ada kebutuhan yang belum ditentukan PRD, tandai sebagai asumsi dan jangan mengambil keputusan besar secara diam-diam.
10. Uji state loading, empty, error, validasi, unggah lampiran, serta tampilan mobile.

**Prinsip akhir:** Finora harus terlihat menarik, tetapi kepercayaan terhadap data keuangan lebih penting daripada dekorasi. Setiap angka harus dapat ditelusuri ke transaksi dan sumber pencatatannya.
