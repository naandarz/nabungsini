# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# FINORA — Smart Personal Finance Management

**Dokumen:** PRD.md  
**Versi:** 1.0  
**Status:** Draft untuk perencanaan dan pengembangan  
**Nama produk:** Finora (nama kerja, dapat diganti)  
**Jenis produk:** Personal Finance Management Web Application  
**Target awal:** Pengguna individu di Indonesia, dengan dukungan pengembangan untuk pengelolaan keuangan keluarga  
**Bahasa utama:** Bahasa Indonesia  
**Mata uang utama:** Rupiah (IDR)

---

## 1. Ringkasan Produk

Finora adalah aplikasi web pengelolaan keuangan yang membantu pengguna mencatat, mengatur, memantau, dan memahami kondisi keuangannya dalam satu tempat. Aplikasi menggabungkan pencatatan pemasukan dan pengeluaran, pengelolaan rekening dan e-wallet, tabungan dan target keuangan, perencanaan anggaran, analisis finansial, laporan, notifikasi, edukasi keuangan, serta AI Financial Assistant.

Finora tidak hanya berfungsi sebagai buku kas digital. Sistem harus mengolah transaksi menjadi informasi yang mudah dipahami, misalnya tren pengeluaran, arus kas, progres tabungan, penggunaan anggaran, dan rekomendasi yang dapat ditindaklanjuti.

Pengguna dapat memulai dengan pencatatan manual. Pada tahap berikutnya, pengguna dapat menghubungkan rekening bank atau e-wallet melalui penyedia integrasi resmi yang tersedia dan memenuhi persyaratan. Impor mutasi CSV/Excel disediakan sebagai jalur transisi ketika integrasi langsung belum tersedia.

### 1.1 Visi

Menjadi pusat kendali keuangan pribadi yang aman, mudah digunakan, transparan, dan membantu pengguna mengambil keputusan finansial berdasarkan data.

### 1.2 Misi

- Memudahkan pencatatan seluruh transaksi keuangan.
- Memberikan gambaran saldo dan arus kas dari berbagai akun.
- Membantu pengguna membuat anggaran dan mencapai target tabungan.
- Mengubah data transaksi menjadi insight dan rekomendasi yang mudah dipahami.
- Menyediakan integrasi finansial yang aman dan berbasis persetujuan.
- Meningkatkan literasi dan kebiasaan pengelolaan keuangan.

### 1.3 Prinsip Produk

1. **User-controlled:** Pengguna mengendalikan data, akun yang dihubungkan, dan izin akses.
2. **Accurate by design:** Saldo, transfer, dan laporan harus mengikuti aturan pembukuan yang konsisten.
3. **Manual-first, integration-ready:** Fitur manual harus berguna secara mandiri; integrasi otomatis merupakan peningkatan, bukan prasyarat MVP.
4. **Explainable insights:** Setiap insight dan rekomendasi harus menunjukkan data atau alasan yang mendasarinya.
5. **Privacy and security:** Data keuangan diperlakukan sebagai data sangat sensitif.
6. **Progressive delivery:** Produk dibangun bertahap agar fitur inti dapat digunakan lebih awal.

---

## 2. Permasalahan yang Ingin Diselesaikan

Pengguna sering menyimpan uang di beberapa rekening bank dan e-wallet, tetapi tidak memiliki gambaran terpadu tentang total saldo, pengeluaran, tabungan, dan kewajiban. Pencatatan manual di buku atau spreadsheet dapat memakan waktu dan tidak selalu menghasilkan analisis yang mudah dipahami.

Masalah utama:

- Data keuangan tersebar di beberapa aplikasi dan rekening.
- Pengguna kesulitan mengetahui total saldo lintas akun.
- Pengeluaran kecil sering tidak tercatat.
- Pengguna tidak mengetahui kategori yang paling banyak menghabiskan uang.
- Target tabungan tidak memiliki pemantauan yang konsisten.
- Anggaran sering dibuat tetapi tidak dievaluasi.
- Laporan transaksi sulit dibandingkan antarperiode.
- Pengguna membutuhkan saran berdasarkan kondisi keuangan aktual, bukan tips yang terlalu umum.
- Integrasi rekening memiliki kendala akses, dukungan penyedia, keamanan, dan persetujuan.

### 2.1 Solusi

Finora menyediakan satu platform untuk menggabungkan data manual dan data dari sumber yang terhubung, menormalkan transaksi, menghitung kondisi keuangan, dan menyajikan hasilnya dalam dashboard, laporan, serta rekomendasi.

---

## 3. Target Pengguna dan Persona

### 3.1 Target Pengguna Utama

Individu yang ingin mengelola keuangan pribadi, seperti mahasiswa, pekerja, freelancer, dan pemilik usaha kecil yang membutuhkan pencatatan sederhana hingga analisis keuangan yang lebih terstruktur.

### 3.2 Target Pengembangan Berikutnya

Keluarga atau pasangan yang ingin mengelola anggaran bersama dengan pembagian peran dan izin akses. Fitur ini bukan bagian wajib MVP.

### 3.3 Persona

**Persona A — Mahasiswa**
- Memiliki uang saku atau pemasukan tambahan.
- Menggunakan satu atau beberapa e-wallet.
- Ingin mengontrol pengeluaran harian dan menabung untuk tujuan tertentu.
- Membutuhkan aplikasi sederhana dan mudah digunakan.

**Persona B — Pekerja**
- Memiliki pemasukan rutin dan tagihan bulanan.
- Menggunakan beberapa rekening dan e-wallet.
- Ingin membuat anggaran, dana darurat, dan laporan bulanan.
- Membutuhkan ringkasan kondisi keuangan yang cepat.

**Persona C — Freelancer**
- Memiliki pemasukan tidak tetap.
- Membutuhkan pencatatan sumber pemasukan dan biaya pekerjaan.
- Ingin memperkirakan arus kas dan menyisihkan dana untuk kebutuhan mendatang.

---

## 4. Tujuan Produk dan Indikator Keberhasilan

### 4.1 Tujuan

- Pengguna dapat mencatat transaksi dengan cepat.
- Pengguna dapat melihat saldo dan kondisi keuangan dalam satu dashboard.
- Pengguna dapat menyusun anggaran dan target tabungan.
- Pengguna dapat memahami pola pemasukan dan pengeluaran.
- Pengguna memperoleh insight yang relevan dan dapat ditelusuri sumber datanya.

### 4.2 Indikator Keberhasilan (KPI)

| Indikator | Definisi |
|---|---|
| Aktivasi pengguna | Pengguna menyelesaikan onboarding dan mencatat transaksi pertama |
| Pengguna aktif bulanan | Pengguna yang membuka aplikasi dan melakukan aktivitas bermakna dalam satu bulan |
| Konsistensi pencatatan | Jumlah hari aktif mencatat transaksi dalam periode tertentu |
| Penggunaan anggaran | Persentase pengguna yang membuat dan memantau anggaran |
| Target tabungan | Persentase pengguna yang membuat target dan memperbarui progres |
| Kualitas kategorisasi | Persentase transaksi yang dikategorikan dengan benar |
| Keandalan data | Jumlah kesalahan saldo, duplikasi, atau sinkronisasi |
| Kegunaan insight | Penilaian pengguna terhadap relevansi dan kejelasan rekomendasi |

Target numerik KPI ditetapkan setelah pengujian MVP dan pengumpulan baseline. Jangan menetapkan angka keberhasilan tanpa data awal.

---

## 5. Ruang Lingkup Produk

### 5.1 Termasuk dalam Produk

- Registrasi, login, dan profil pengguna.
- Onboarding dan pengaturan preferensi.
- Dashboard keuangan.
- Multi-account manual.
- Pencatatan pemasukan, pengeluaran, dan transfer.
- Kategori dan subkategori transaksi.
- Impor transaksi CSV/Excel.
- Tabungan dan target keuangan.
- Budget planner.
- Analisis dan laporan keuangan.
- Notifikasi dan pengingat.
- AI Financial Assistant.
- Pusat edukasi keuangan.
- Pengaturan privasi, keamanan, dan ekspor data.
- Integrasi bank/e-wallet melalui adapter penyedia resmi pada fase lanjutan.

### 5.2 Tidak Termasuk dalam MVP

- Menyimpan atau memproses kredensial internet banking pengguna.
- Melakukan transfer uang atau pembayaran dari aplikasi.
- Menjadi bank, dompet elektronik, atau penyedia jasa pembayaran.
- Menyimpan dana pengguna.
- Memberikan rekomendasi investasi personal yang menjanjikan keuntungan.
- Perdagangan saham, kripto, atau produk investasi.
- Pengajuan pinjaman atau penilaian kredit.
- Akun keluarga dengan kolaborasi multianggota.
- Integrasi langsung ke seluruh bank dan e-wallet sejak peluncuran.
- Aplikasi native iOS/Android.

Fitur-fitur tersebut hanya dapat dipertimbangkan melalui kajian produk, teknis, keamanan, perizinan, dan kerja sama yang sesuai.

---

## 6. Struktur Navigasi dan Modul

Navigasi utama yang disarankan:

1. Dashboard
2. Transaksi
3. Akun & Rekening
4. Tabungan & Target
5. Anggaran
6. Analisis Keuangan
7. AI Financial Assistant
8. Laporan Keuangan
9. Edukasi Keuangan
10. Notifikasi
11. Pengaturan

### 6.1 Dashboard

Dashboard merupakan ringkasan kondisi keuangan pengguna.

Informasi:
- Total saldo akun yang tercatat dan aktif.
- Total pemasukan periode berjalan.
- Total pengeluaran periode berjalan.
- Total transfer internal (ditampilkan terpisah, tidak dihitung sebagai pemasukan/pengeluaran).
- Total alokasi tabungan atau progres target.
- Ringkasan arus kas.
- Grafik pemasukan dan pengeluaran.
- Pengeluaran berdasarkan kategori.
- Transaksi terbaru.
- Ringkasan anggaran.
- Progres target tabungan.
- Insight atau peringatan penting.

Kontrol:
- Filter periode: hari ini, 7 hari, bulan ini, bulan sebelumnya, tahun ini, dan rentang khusus.
- Filter akun.
- Pilihan tampilan ringkas atau detail.
- Tautan menuju daftar transaksi dan laporan terkait.

Aturan:
- Saldo gabungan hanya menghitung akun yang disertakan pengguna dan tidak diarsipkan.
- Saldo akun manual merupakan saldo yang dikelola berdasarkan transaksi awal dan transaksi berikutnya.
- Saldo akun terhubung harus menunjukkan waktu sinkronisasi terakhir.
- Data yang belum tersinkron tidak boleh ditampilkan seolah-olah real-time.
- Saldo rekening bukan otomatis sama dengan kekayaan bersih; aset dan kewajiban harus dibedakan.

### 6.2 Transaksi

Pengguna dapat membuat, melihat, mengubah, menghapus, mencari, memfilter, dan mengimpor transaksi.

Jenis transaksi:
- Income / pemasukan.
- Expense / pengeluaran.
- Transfer antar-akun.
- Penyesuaian saldo (dengan alasan dan jejak audit).

Data transaksi:
- ID transaksi.
- Jenis transaksi.
- Nominal.
- Mata uang.
- Tanggal dan waktu.
- Akun sumber.
- Akun tujuan untuk transfer.
- Kategori dan subkategori.
- Deskripsi atau catatan.
- Merchant/penerima (opsional).
- Lampiran bukti transaksi (opsional).
- Sumber data: manual, impor, atau integrasi.
- Status: tercatat, menunggu, dibatalkan, atau perlu ditinjau bila relevan.
- ID eksternal dan metadata sinkronisasi untuk transaksi terintegrasi.
- Waktu dibuat dan diperbarui.

Fitur:
- Form transaksi cepat.
- Kategori yang dapat disesuaikan.
- Pencarian kata kunci.
- Filter jenis, akun, kategori, dan rentang tanggal.
- Pengurutan berdasarkan tanggal atau nominal.
- Duplikasi transaksi.
- Transaksi berulang.
- Upload bukti transaksi.
- Impor CSV/Excel dengan pemetaan kolom dan pratinjau.
- Deteksi kemungkinan transaksi duplikat.
- Ekspor data transaksi.

Aturan pembukuan:
- Nominal transaksi harus lebih besar dari nol.
- Transfer internal mengurangi saldo akun sumber dan menambah saldo akun tujuan dengan nilai yang sama.
- Transfer internal tidak dihitung sebagai income atau expense.
- Biaya transfer, bila ada, dicatat sebagai expense terpisah.
- Penghapusan transaksi harus memperbarui saldo dan laporan secara konsisten.
- Transaksi dari integrasi harus memiliki mekanisme idempotensi agar sinkronisasi ulang tidak membuat duplikasi.
- Zona waktu dan tanggal transaksi harus ditangani secara konsisten.

### 6.3 Akun & Rekening

Akun merepresentasikan tempat uang disimpan atau digunakan.

Jenis akun:
- Rekening bank.
- E-wallet.
- Uang tunai.
- Rekening tabungan.
- Akun lain yang dapat dikonfigurasi.

Data akun:
- Nama akun.
- Jenis akun.
- Nama institusi atau penyedia.
- Nama tampilan.
- Saldo awal.
- Saldo saat ini.
- Mata uang.
- Status aktif/arsip.
- Sumber data: manual atau terhubung.
- Waktu sinkronisasi terakhir.
- Pengaturan apakah akun masuk perhitungan total saldo.

Fitur:
- Tambah, ubah, arsipkan akun.
- Lihat saldo per akun.
- Riwayat transaksi per akun.
- Transfer antar-akun.
- Rekonsiliasi saldo.
- Menghubungkan atau memutus koneksi penyedia pada fase integrasi.
- Status koneksi dan waktu sinkronisasi.

Catatan:
- Pengguna tidak boleh diminta memasukkan PIN, password internet banking, atau OTP untuk disimpan oleh Finora.
- Koneksi harus menggunakan alur otorisasi resmi penyedia.
- Jika integrasi belum tersedia, pengguna dapat membuat akun manual dan mengimpor mutasi.

### 6.4 Tabungan & Target Keuangan

Pengguna dapat membuat beberapa target tabungan.

Data target:
- Nama target.
- Deskripsi.
- Nominal target.
- Nominal terkumpul.
- Tanggal mulai.
- Tenggat.
- Prioritas.
- Akun sumber atau akun penampung (opsional).
- Status: aktif, tercapai, ditunda, atau dibatalkan.
- Riwayat kontribusi dan penarikan.

Fitur:
- Membuat dan mengubah target.
- Menambah kontribusi.
- Mencatat penarikan.
- Melihat progres nominal dan persentase.
- Menghitung estimasi kontribusi harian, mingguan, atau bulanan.
- Menampilkan estimasi tanggal tercapai berdasarkan pola kontribusi.
- Mengingatkan tenggat dan progres.
- Membandingkan progres antar-target.

Aturan:
- Kontribusi tabungan harus direpresentasikan secara jelas agar tidak terjadi penghitungan ganda.
- Jika uang dipindahkan dari rekening utama ke rekening tabungan milik pengguna, catat sebagai transfer internal dan kontribusi target sebagai alokasi, bukan expense konsumtif.
- Target tabungan bukan saldo tambahan yang boleh dijumlahkan lagi ke total saldo akun.
- Penarikan dari target harus mengurangi progres dan tercatat.

### 6.5 Budget Planner

Pengguna dapat menetapkan anggaran berdasarkan periode dan kategori.

Fitur:
- Anggaran bulanan dan periode khusus.
- Anggaran per kategori.
- Batas total pengeluaran.
- Progres pemakaian anggaran.
- Peringatan saat mendekati atau melewati batas.
- Perbandingan anggaran dan realisasi.
- Salin anggaran periode sebelumnya.

Aturan:
- Transfer internal tidak mengurangi anggaran pengeluaran.
- Pengeluaran dihitung berdasarkan tanggal transaksi dan kategori.
- Pengembalian dana/refund harus memiliki aturan yang konsisten, misalnya mengurangi expense terkait atau dicatat sebagai transaksi refund.
- Pengguna dapat menentukan ambang peringatan, misalnya 70%, 85%, dan 100%.
- Perubahan kategori harus memperbarui perhitungan anggaran terkait.

### 6.6 Analisis Keuangan

Modul ini mengubah transaksi menjadi informasi.

Analisis:
- Pemasukan dan pengeluaran per periode.
- Arus kas bersih.
- Tren pengeluaran.
- Pengeluaran berdasarkan kategori.
- Perbandingan antarbulan.
- Rata-rata pengeluaran harian.
- Pengeluaran berulang.
- Sumber pemasukan.
- Progres tabungan.
- Anggaran versus realisasi.
- Saldo lintas akun.
- Aset dan kewajiban jika pengguna mengaktifkan pencatatan tersebut.

Financial Health Score dapat dikembangkan sebagai indikator edukatif, bukan penilaian kredit atau diagnosis finansial. Skor harus transparan, menjelaskan faktor pembentuknya, dan tidak boleh menyesatkan.

### 6.7 AI Financial Assistant

AI Financial Assistant membantu pengguna memahami data dan menyusun langkah pengelolaan keuangan.

Kemampuan:
- Menjawab pertanyaan tentang transaksi dan ringkasan keuangan.
- Merangkum pengeluaran harian, mingguan, dan bulanan.
- Mengidentifikasi kategori dengan pengeluaran tertinggi.
- Membandingkan periode.
- Menemukan pola pengeluaran berulang.
- Memberikan saran penghematan.
- Membantu menyusun anggaran.
- Menghitung skenario pencapaian target tabungan.
- Memberikan peringatan berbasis aturan dan data.
- Menjelaskan alasan di balik setiap rekomendasi.

Contoh insight:
- “Pengeluaran makan bulan ini 18% lebih tinggi daripada bulan lalu.”
- “Dengan rata-rata pemasukan dan pengeluaran tiga bulan terakhir, estimasi kemampuan menabung Anda sekitar Rp450.000 per bulan.”
- “Kategori transportasi telah menggunakan 90% dari anggaran bulan ini.”

Persyaratan AI:
- AI hanya boleh menggunakan data yang diizinkan pengguna dan diperlukan untuk pertanyaan.
- Backend harus menghitung angka keuangan; LLM tidak boleh menjadi sumber perhitungan saldo utama.
- Setiap angka harus berasal dari hasil perhitungan terverifikasi.
- Insight mencantumkan periode dan data pembanding.
- Jika data kurang, AI harus menyatakan keterbatasannya.
- AI tidak boleh mengarang transaksi, saldo, atau kondisi keuangan.
- Rekomendasi harus bersifat informatif, bukan jaminan hasil.
- AI tidak boleh memberikan janji keuntungan investasi atau instruksi berisiko.
- Pengguna dapat menghapus riwayat percakapan AI.
- Sediakan batas penggunaan, penanganan error, dan fallback tanpa AI.

### 6.8 Laporan Keuangan

Laporan yang tersedia:
- Laporan pemasukan dan pengeluaran.
- Laporan arus kas.
- Laporan kategori pengeluaran.
- Laporan anggaran.
- Laporan target tabungan.
- Ringkasan saldo akun.
- Perbandingan antarperiode.

Fitur:
- Filter tanggal dan akun.
- Grafik dan tabel.
- Unduh PDF.
- Ekspor Excel/CSV.
- Ringkasan naratif.
- Waktu pembuatan laporan.

Laporan harus mengecualikan transfer internal dari total pemasukan dan pengeluaran, kecuali laporan khusus transfer.

### 6.9 Edukasi Keuangan

Pusat informasi yang dapat berisi:
- Dasar pencatatan keuangan.
- Anggaran dan cash flow.
- Dana darurat.
- Tabungan dan tujuan finansial.
- Pengelolaan utang.
- Literasi rekening dan e-wallet.
- Dasar investasi dan risiko.
- Keamanan digital dan penipuan finansial.

Konten harus memiliki sumber, tanggal pembaruan, dan penjelasan bahwa materi bersifat edukatif. Konten investasi tidak boleh menjanjikan keuntungan.

### 6.10 Notifikasi dan Pengingat

Jenis notifikasi:
- Anggaran mendekati batas.
- Anggaran terlampaui.
- Tagihan mendekati jatuh tempo.
- Target tabungan mendekati tenggat.
- Target tercapai.
- Pengeluaran tidak biasa berdasarkan aturan yang jelas.
- Sinkronisasi akun gagal.
- Laporan bulanan tersedia.

Pengguna dapat mengatur kanal, frekuensi, jenis, dan waktu notifikasi. Hindari notifikasi berlebihan.

### 6.11 Pengaturan dan Privasi

- Profil pengguna.
- Preferensi mata uang dan zona waktu.
- Pengaturan kategori.
- Pengaturan notifikasi.
- Pengaturan AI dan izin pemrosesan data.
- Kelola koneksi bank/e-wallet.
- Ekspor data pribadi.
- Hapus data atau akun.
- Kelola sesi dan perangkat.
- Kebijakan privasi dan persetujuan.

---

## 7. Integrasi Bank dan E-Wallet

Integrasi adalah fitur strategis, tetapi ketersediaannya bergantung pada akses resmi, kerja sama, ketentuan penyedia, dan regulasi yang berlaku.

### 7.1 Tujuan

Memungkinkan pengguna melihat data rekening dan transaksi yang diizinkan dalam satu dashboard tanpa harus memasukkan transaksi satu per satu.

### 7.2 Pendekatan Integrasi

Urutan pendekatan:
1. Pencatatan manual sebagai fondasi.
2. Impor mutasi CSV/Excel.
3. Integrasi melalui penyedia agregasi/open finance yang resmi dan sesuai kebutuhan.
4. Integrasi langsung dengan institusi jika tersedia dan disetujui.
5. Perluasan penyedia berdasarkan kelayakan teknis dan bisnis.

Contoh institusi yang dapat dievaluasi untuk dukungan di masa depan: BCA, Mandiri, BRI, BNI, DANA, GoPay, OVO, dan ShopeePay. Penyebutan ini bukan pernyataan bahwa API transaksi pribadi tersedia atau bahwa kerja sama sudah terjalin.

### 7.3 Alur Koneksi

1. Pengguna memilih institusi.
2. Sistem menampilkan penyedia integrasi dan izin yang akan diminta.
3. Pengguna diarahkan ke alur otorisasi resmi.
4. Pengguna menyetujui akses yang diminta.
5. Sistem menerima token atau referensi koneksi yang aman.
6. Backend mengambil data sesuai izin.
7. Data dinormalisasi ke format transaksi Finora.
8. Sistem melakukan deduplikasi dan rekonsiliasi.
9. Dashboard menampilkan data beserta waktu sinkronisasi.
10. Pengguna dapat memperbarui atau memutus koneksi.

### 7.4 Persyaratan Keamanan Integrasi

- Tidak menyimpan PIN, password internet banking, atau OTP.
- Gunakan OAuth atau mekanisme otorisasi resmi yang disediakan mitra.
- Token disimpan terenkripsi dan tidak pernah dikirim ke frontend.
- Terapkan scope minimum dan prinsip least privilege.
- Sediakan pencabutan koneksi.
- Catat aktivitas koneksi dan sinkronisasi.
- Gunakan webhook atau polling sesuai kemampuan penyedia.
- Terapkan idempotency key dan deduplikasi.
- Tampilkan status dan waktu sinkronisasi terakhir.
- Tangani token kedaluwarsa, rate limit, dan kegagalan penyedia.
- Jangan mengklaim data real-time jika penyedia tidak menjaminnya.

### 7.5 Fallback Impor Mutasi

Format:
- CSV.
- XLSX.

Alur:
1. Pengguna memilih akun tujuan.
2. Mengunggah file.
3. Sistem membaca dan menampilkan pratinjau.
4. Pengguna memetakan kolom tanggal, deskripsi, nominal, debit/kredit, dan saldo jika tersedia.
5. Sistem memvalidasi format.
6. Sistem menampilkan kemungkinan duplikasi.
7. Pengguna mengonfirmasi impor.
8. Transaksi disimpan dan saldo direkonsiliasi.

---

## 8. Alur Pengguna Utama

### 8.1 Registrasi dan Onboarding

1. Pengguna membuka Finora.
2. Pengguna mendaftar atau login.
3. Pengguna menyetujui ketentuan dan kebijakan privasi.
4. Pengguna memilih preferensi dasar.
5. Pengguna membuat akun keuangan pertama atau melewati langkah ini.
6. Pengguna dapat mengisi saldo awal.
7. Sistem menampilkan dashboard kosong dengan panduan tindakan berikutnya.

### 8.2 Mencatat Transaksi

1. Pengguna memilih tombol tambah transaksi.
2. Memilih pemasukan, pengeluaran, atau transfer.
3. Mengisi nominal, tanggal, akun, kategori, dan catatan.
4. Sistem memvalidasi input.
5. Pengguna menyimpan transaksi.
6. Sistem memperbarui saldo dan ringkasan.
7. Transaksi tampil pada riwayat.

### 8.3 Membuat Target Tabungan

1. Pengguna membuka Tabungan & Target.
2. Memilih buat target.
3. Mengisi nama, nominal, tenggat, dan prioritas.
4. Sistem menghitung kontribusi yang disarankan.
5. Pengguna mencatat kontribusi.
6. Sistem memperbarui progres dan estimasi.

### 8.4 Membuat Anggaran

1. Pengguna membuka Budget Planner.
2. Memilih periode.
3. Memilih kategori dan nominal anggaran.
4. Menyimpan anggaran.
5. Sistem membandingkan transaksi dengan anggaran.
6. Sistem memberikan peringatan sesuai ambang.

### 8.5 Meminta Analisis AI

1. Pengguna membuka AI Financial Assistant.
2. Memilih pertanyaan atau mengetik pertanyaan.
3. Backend memeriksa izin dan mengambil ringkasan data yang diperlukan.
4. Backend menghitung metrik keuangan.
5. AI menyusun penjelasan berdasarkan hasil tersebut.
6. Sistem menampilkan jawaban, periode, dan dasar analisis.
7. Pengguna dapat membuka transaksi atau laporan pendukung.

### 8.6 Menghubungkan Akun

1. Pengguna membuka Akun & Rekening.
2. Memilih Hubungkan Akun.
3. Memilih institusi yang didukung.
4. Membaca izin dan ketentuan.
5. Menyelesaikan otorisasi di penyedia.
6. Finora menerima koneksi yang sah.
7. Sistem menyinkronkan transaksi.
8. Pengguna meninjau dan mengonfirmasi hasil jika diperlukan.

---

## 9. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-001 | Pengguna dapat mendaftar, login, dan logout | Must |
| FR-002 | Pengguna dapat mengelola profil dan preferensi | Must |
| FR-003 | Pengguna dapat membuat beberapa akun keuangan manual | Must |
| FR-004 | Pengguna dapat mencatat pemasukan, pengeluaran, dan transfer | Must |
| FR-005 | Sistem menghitung saldo akun secara konsisten | Must |
| FR-006 | Pengguna dapat mengelola kategori transaksi | Must |
| FR-007 | Pengguna dapat mencari dan memfilter transaksi | Must |
| FR-008 | Pengguna dapat membuat target tabungan | Must |
| FR-009 | Pengguna dapat membuat anggaran | Must |
| FR-010 | Dashboard menampilkan ringkasan keuangan | Must |
| FR-011 | Sistem menyediakan grafik dan analisis dasar | Must |
| FR-012 | Pengguna dapat mengekspor transaksi | Must |
| FR-013 | Pengguna dapat mengimpor CSV/XLSX | Should |
| FR-014 | Sistem menyediakan laporan PDF/Excel | Should |
| FR-015 | Sistem mengirim notifikasi anggaran dan target | Should |
| FR-016 | AI dapat meringkas dan menganalisis data terpilih | Should |
| FR-017 | Sistem menyediakan pusat edukasi | Could |
| FR-018 | Sistem mendukung integrasi bank/e-wallet resmi | Later |
| FR-019 | Sistem mendukung akun keluarga | Later |
| FR-020 | Sistem mendukung pengelolaan aset dan kewajiban | Later |

Prioritas:
- **Must:** Wajib agar MVP dapat digunakan.
- **Should:** Penting, tetapi dapat menyusul setelah fondasi stabil.
- **Could:** Nilai tambah.
- **Later:** Bergantung pada kesiapan teknis, mitra, dan kepatuhan.

---

## 10. Kebutuhan Nonfungsional

### 10.1 Keamanan

- Gunakan HTTPS untuk seluruh komunikasi.
- Password disimpan menggunakan algoritma hashing yang kuat dan sesuai praktik terkini.
- Terapkan kontrol akses berbasis pengguna.
- Setiap query data harus dibatasi berdasarkan pemilik data.
- Terapkan proteksi terhadap SQL injection, XSS, CSRF, dan penyalahgunaan API.
- Validasi input di frontend dan backend.
- Rate limiting pada endpoint sensitif.
- Rahasiakan API key melalui environment/secrets manager.
- Enkripsi data sensitif saat transit dan saat tersimpan sesuai kebutuhan risiko.
- Terapkan audit log untuk aktivitas penting.
- Backup database terenkripsi dan uji pemulihan.
- Jangan mencatat token, password, OTP, atau data sensitif dalam log.
- Terapkan pengelolaan sesi dan pencabutan akses.

### 10.2 Privasi

- Kumpulkan data seminimal mungkin.
- Jelaskan tujuan pemrosesan data.
- Minta persetujuan sebelum menghubungkan akun.
- Berikan kontrol ekspor dan penghapusan data.
- Jelaskan apakah data digunakan oleh layanan AI pihak ketiga.
- Jangan mengirim data mentah yang tidak diperlukan ke model AI.
- Sediakan pengaturan retensi data dan riwayat AI.

### 10.3 Performa dan Keandalan

- Dashboard menggunakan agregasi yang efisien.
- Daftar transaksi mendukung pagination.
- Operasi impor dilakukan secara bertahap untuk file besar.
- Kegagalan AI tidak boleh mengganggu pencatatan transaksi.
- Kegagalan sinkronisasi tidak boleh merusak data lokal/server yang sudah tersimpan.
- Tampilkan loading, empty state, error state, dan retry yang jelas.
- Terapkan monitoring error dan pencatatan kesehatan layanan.

### 10.4 Aksesibilitas dan Responsivitas

- Mendukung desktop, tablet, dan ponsel.
- Navigasi mudah dipahami.
- Kontras warna memadai.
- Form memiliki label dan pesan validasi.
- Grafik memiliki ringkasan teks atau tabel pendamping.
- Interaksi utama dapat digunakan dengan keyboard.

---

## 11. Model Data Awal

Model berikut merupakan rancangan konseptual dan dapat disesuaikan saat desain database.

### 11.1 Entitas

**users**
- id
- name
- email
- password_hash atau external_auth_id
- locale
- timezone
- created_at
- updated_at

**user_preferences**
- id
- user_id
- default_currency
- date_format
- notification_preferences
- privacy_preferences

**financial_accounts**
- id
- user_id
- name
- account_type
- institution_name
- currency
- opening_balance
- current_balance_cache
- source_type (manual/import/connected)
- include_in_total
- status
- last_synced_at
- created_at
- updated_at

**transactions**
- id
- user_id
- account_id
- transaction_type
- amount
- currency
- transaction_date
- category_id
- description
- merchant
- source_type
- external_transaction_id
- idempotency_key
- status
- created_at
- updated_at

**transfers**
- id
- user_id
- transaction_group_id
- source_account_id
- destination_account_id
- amount
- transfer_date
- fee_transaction_id
- description

**categories**
- id
- user_id (nullable untuk kategori sistem)
- name
- type
- parent_category_id
- icon
- color
- is_default

**budgets**
- id
- user_id
- name
- period_type
- start_date
- end_date
- total_limit
- status

**budget_categories**
- id
- budget_id
- category_id
- limit_amount
- alert_thresholds

**savings_goals**
- id
- user_id
- name
- target_amount
- current_amount_cache
- start_date
- target_date
- priority
- status
- description

**savings_contributions**
- id
- goal_id
- amount
- contribution_date
- related_transaction_id
- note

**recurring_transactions**
- id
- user_id
- account_id
- transaction_template
- frequency
- next_run_at
- end_date
- status

**attachments**
- id
- user_id
- transaction_id
- storage_key
- file_name
- mime_type
- file_size
- created_at

**financial_connections**
- id
- user_id
- provider_id
- external_account_reference
- encrypted_token_reference
- granted_scopes
- connection_status
- last_synced_at
- expires_at

**sync_jobs**
- id
- connection_id
- started_at
- completed_at
- status
- records_processed
- error_code

**notifications**
- id
- user_id
- type
- title
- body
- read_at
- created_at

**ai_conversations**
- id
- user_id
- title
- created_at
- updated_at

**ai_messages**
- id
- conversation_id
- role
- content
- metadata
- created_at

**audit_logs**
- id
- user_id
- action
- resource_type
- resource_id
- metadata_redacted
- created_at

### 11.2 Aturan Data Penting

- Semua data milik pengguna harus memiliki relasi kepemilikan yang dapat diverifikasi backend.
- Gunakan UUID atau ID unik yang tidak mudah ditebak.
- Nominal uang disimpan menggunakan tipe decimal/numeric, bukan floating point.
- Simpan mata uang secara eksplisit.
- Gunakan transaksi database untuk perubahan saldo dan transfer.
- Saldo cache harus dapat direkonstruksi dari saldo awal dan ledger transaksi.
- Jangan menjadikan `current_balance_cache` satu-satunya sumber kebenaran.
- Simpan referensi transaksi eksternal untuk deduplikasi.
- Data token koneksi harus dienkripsi dan dipisahkan dari data transaksi.
- Penghapusan dan perubahan data penting harus memiliki kebijakan audit yang jelas.

---

## 12. Arsitektur dan Teknologi yang Direkomendasikan

Arsitektur awal menggunakan frontend web, backend API, database relasional, dan layanan AI/integrasi yang dipisahkan.

### 12.1 Stack

| Lapisan | Teknologi | Tanggung jawab |
|---|---|---|
| Frontend | React + TypeScript + Vite | Antarmuka aplikasi |
| Styling | Tailwind CSS + shadcn/ui | Sistem komponen UI |
| Routing | React Router | Navigasi |
| Data fetching | TanStack Query | Cache dan sinkronisasi data API |
| Form | React Hook Form + Zod | Form dan validasi |
| Grafik | Recharts | Visualisasi keuangan |
| Backend | Python + FastAPI | API dan business logic |
| Database | PostgreSQL | Penyimpanan utama |
| ORM/migrasi | SQLAlchemy + Alembic | Akses dan perubahan skema |
| Authentication | Auth service atau implementasi backend yang teruji | Identitas dan sesi |
| File storage | S3-compatible storage | Bukti transaksi dan dokumen |
| AI | LLM API melalui adapter backend | Insight dan percakapan |
| Background jobs | Celery/RQ atau worker setara | Impor, laporan, sinkronisasi |
| Deployment | Container + managed hosting | Rilis dan operasional |
| Monitoring | Error tracking dan structured logs | Observabilitas |

Catatan:
- Pilih satu pendekatan autentikasi dan implementasikan secara konsisten. Jangan mencampur dua sistem autentikasi tanpa kebutuhan yang jelas.
- Supabase dapat dipilih sebagai layanan PostgreSQL/Auth/Storage terkelola, tetapi bukan kewajiban. Jika memakai Supabase Auth, backend harus memverifikasi token dengan benar.
- Integrasi bank/e-wallet dibuat melalui provider adapter agar penyedia dapat diganti tanpa mengubah domain transaksi.
- Kunci AI dan kredensial penyedia hanya berada di backend.

### 12.2 Gambaran Arsitektur

```text
Browser / PWA
     |
     v
React + TypeScript
     |
     v
Backend API (FastAPI)
     |
     +------ Authentication & Authorization
     |
     +------ Finance Domain
     |          |
     |          +--- Accounts
     |          +--- Transactions / Ledger
     |          +--- Budgets
     |          +--- Savings Goals
     |          +--- Reports & Analytics
     |
     +------ AI Orchestrator
     |          |
     |          +--- Metrics / Aggregation
     |          +--- LLM Provider Adapter
     |
     +------ Integration Service
     |          |
     |          +--- Bank / Open Finance Provider
     |          +--- E-wallet Provider
     |          +--- CSV / XLSX Import
     |
     +------ Notification & Background Worker
     |
     v
PostgreSQL + Object Storage
```

### 12.3 Prinsip Arsitektur

- Pisahkan domain transaksi, akun, anggaran, dan target tabungan.
- Backend menjadi sumber kebenaran untuk data finansial.
- Gunakan API versioning.
- Gunakan database transaction untuk operasi finansial.
- Gunakan worker untuk pekerjaan berat.
- Semua integrasi eksternal harus memiliki adapter.
- AI hanya menerima hasil agregasi atau data minimum yang diperlukan.
- Sistem harus tetap dapat mencatat dan melihat data inti ketika layanan AI tidak tersedia.

---

## 13. Rancangan API Awal

Contoh endpoint REST:

### Authentication & Profile
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `PATCH /api/v1/me`

### Accounts
- `GET /api/v1/accounts`
- `POST /api/v1/accounts`
- `GET /api/v1/accounts/{id}`
- `PATCH /api/v1/accounts/{id}`
- `DELETE /api/v1/accounts/{id}`

### Transactions
- `GET /api/v1/transactions`
- `POST /api/v1/transactions`
- `GET /api/v1/transactions/{id}`
- `PATCH /api/v1/transactions/{id}`
- `DELETE /api/v1/transactions/{id}`
- `POST /api/v1/transfers`
- `POST /api/v1/transactions/import`
- `GET /api/v1/transactions/export`

### Budgets
- `GET /api/v1/budgets`
- `POST /api/v1/budgets`
- `PATCH /api/v1/budgets/{id}`
- `GET /api/v1/budgets/{id}/progress`

### Savings Goals
- `GET /api/v1/savings-goals`
- `POST /api/v1/savings-goals`
- `PATCH /api/v1/savings-goals/{id}`
- `POST /api/v1/savings-goals/{id}/contributions`

### Analytics & Reports
- `GET /api/v1/analytics/overview`
- `GET /api/v1/analytics/cashflow`
- `GET /api/v1/analytics/categories`
- `GET /api/v1/reports`
- `POST /api/v1/reports/export`

### AI
- `POST /api/v1/ai/conversations`
- `POST /api/v1/ai/conversations/{id}/messages`
- `GET /api/v1/ai/conversations`
- `DELETE /api/v1/ai/conversations/{id}`

### Integrations (fase lanjutan)
- `GET /api/v1/integrations/providers`
- `POST /api/v1/integrations/connections`
- `GET /api/v1/integrations/connections`
- `DELETE /api/v1/integrations/connections/{id}`
- `POST /api/v1/integrations/connections/{id}/sync`
- `POST /api/v1/integrations/webhooks/{provider}`

Semua endpoint harus menerapkan autentikasi, otorisasi kepemilikan data, validasi, pagination bila relevan, dan format error yang konsisten.

---

## 14. UI/UX dan Design Direction

### 14.1 Karakter Visual

Finora harus terasa:
- Modern dan profesional.
- Bersih dan mudah dipahami.
- Tenang, tidak terlalu ramai.
- Berorientasi pada keterbacaan angka.
- Ramah bagi pengguna yang tidak memiliki latar belakang keuangan.

### 14.2 Arah Desain

- Dashboard dengan sidebar pada desktop.
- Navigasi ringkas pada perangkat mobile.
- Kartu ringkasan saldo, pemasukan, pengeluaran, dan tabungan.
- Grafik dengan legenda dan tooltip.
- Tabel transaksi dengan filter dan pencarian.
- Form transaksi yang singkat.
- Warna status yang konsisten dan tidak hanya mengandalkan warna untuk menyampaikan informasi.
- Format rupiah konsisten, misalnya `Rp1.250.000`.
- Gunakan empty state yang menjelaskan langkah pertama.
- Sediakan konfirmasi untuk tindakan destruktif.
- Tampilkan sumber dan waktu pembaruan data yang terhubung.

### 14.3 Halaman Utama

1. Landing page.
2. Register/Login.
3. Onboarding.
4. Dashboard.
5. Daftar transaksi.
6. Tambah/Edit transaksi.
7. Detail akun.
8. Tabungan dan detail target.
9. Budget planner.
10. Analisis keuangan.
11. AI Financial Assistant.
12. Laporan.
13. Edukasi.
14. Notifikasi.
15. Pengaturan dan privasi.

### 14.4 Status UI Wajib

Setiap halaman data harus memiliki:
- Loading state.
- Empty state.
- Error state.
- Success feedback.
- Validation state.
- Responsive state.

---

## 15. Roadmap Pengembangan

### Fase 0 — Discovery dan Fondasi

- Finalisasi kebutuhan.
- Validasi alur dan aturan pembukuan.
- Wireframe dan design system.
- Desain database.
- Setup repository, environment, CI, dan deployment awal.
- Definisi kebijakan keamanan dan privasi.

**Output:** Dokumen desain, skema awal, dan fondasi proyek.

### Fase 1 — MVP Finance Core

- Registrasi/login.
- Profil dan onboarding.
- Akun keuangan manual.
- Kategori transaksi.
- Pemasukan, pengeluaran, dan transfer.
- Saldo dan ledger.
- Dashboard dasar.
- Tabungan dan target.
- Budget planner.
- Riwayat transaksi dan filter.

**Output:** Aplikasi yang dapat digunakan untuk pencatatan keuangan pribadi secara manual.

### Fase 2 — Reporting dan Data Management

- Analisis pemasukan/pengeluaran.
- Grafik kategori.
- Laporan periode.
- Impor CSV/XLSX.
- Ekspor CSV/Excel/PDF.
- Rekonsiliasi saldo.
- Transaksi berulang.
- Notifikasi dasar.

**Output:** Pengguna dapat mengevaluasi dan memindahkan data keuangan.

### Fase 3 — AI Financial Assistant

- Agregasi metrik finansial.
- AI chat.
- Insight otomatis.
- Rekomendasi anggaran.
- Skenario target tabungan.
- Penjelasan sumber data dan periode.
- Kontrol privasi AI.

**Output:** Asisten yang memberikan analisis berbasis data.

### Fase 4 — Integrasi Bank dan E-Wallet

- Evaluasi penyedia integrasi.
- Kajian persyaratan akses dan kerja sama.
- Implementasi provider adapter.
- Alur persetujuan pengguna.
- Sinkronisasi transaksi.
- Deduplikasi dan rekonsiliasi.
- Status koneksi dan pemulihan error.
- Uji keamanan integrasi.

**Output:** Integrasi pada institusi yang benar-benar didukung dan telah memperoleh akses yang diperlukan.

### Fase 5 — Advanced Finance

- Aset dan kewajiban.
- Financial health indicator.
- Pengelolaan keuangan keluarga.
- PWA yang lebih lengkap.
- Pengingat lanjutan.
- Personalisasi insight.

**Output:** Platform pengelolaan keuangan yang lebih komprehensif.

---

## 16. Acceptance Criteria MVP

MVP dianggap layak untuk pengujian pengguna ketika:

### Akun dan Akses
- [ ] Pengguna dapat mendaftar, login, dan logout.
- [ ] Pengguna hanya dapat mengakses data miliknya.
- [ ] Pengguna dapat memperbarui profil.

### Akun Keuangan
- [ ] Pengguna dapat membuat beberapa akun manual.
- [ ] Pengguna dapat memasukkan saldo awal.
- [ ] Pengguna dapat mengarsipkan akun tanpa merusak riwayat transaksi.

### Transaksi
- [ ] Pengguna dapat membuat pemasukan dan pengeluaran.
- [ ] Pengguna dapat membuat transfer antar-akun.
- [ ] Transfer tidak dihitung sebagai pemasukan/pengeluaran.
- [ ] Perubahan dan penghapusan transaksi memperbarui saldo secara benar.
- [ ] Pengguna dapat mencari dan memfilter transaksi.
- [ ] Sistem menolak nominal dan data yang tidak valid.

### Tabungan dan Anggaran
- [ ] Pengguna dapat membuat target tabungan.
- [ ] Pengguna dapat menambah dan mengurangi kontribusi sesuai aturan.
- [ ] Pengguna dapat membuat anggaran kategori.
- [ ] Sistem menampilkan realisasi dan sisa anggaran.

### Dashboard dan Laporan
- [ ] Dashboard menampilkan ringkasan sesuai periode.
- [ ] Grafik menggunakan data transaksi yang benar.
- [ ] Transfer internal tidak menggandakan pemasukan/pengeluaran.
- [ ] Pengguna dapat melihat laporan dasar.

### Keandalan
- [ ] Kegagalan layanan AI tidak mengganggu transaksi.
- [ ] Data tidak hilang saat halaman dimuat ulang.
- [ ] Error ditampilkan dengan pesan yang dapat dipahami.
- [ ] Operasi saldo dan transfer diuji dengan unit/integration tests.
- [ ] Ekspor data menghasilkan data yang dapat dibaca kembali.

---

## 17. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| API bank/e-wallet tidak tersedia | Integrasi tertunda | Mulai dari manual dan impor mutasi |
| Perbedaan format mutasi | Impor salah | Mapping kolom dan pratinjau |
| Transaksi duplikat | Saldo tidak akurat | Idempotency dan deduplikasi |
| Transfer dihitung sebagai expense/income | Laporan keliru | Model transfer terpisah |
| AI mengarang angka | Rekomendasi menyesatkan | Perhitungan di backend dan grounding |
| Kebocoran data | Dampak privasi dan finansial tinggi | Enkripsi, kontrol akses, audit, dan pengujian |
| Biaya AI meningkat | Biaya operasional | Batas penggunaan, cache, dan model sesuai kebutuhan |
| Sinkronisasi gagal | Data tidak mutakhir | Status sinkronisasi, retry, dan rekonsiliasi |
| Kompleksitas fitur terlalu besar | MVP terlambat | Roadmap bertahap dan batas scope |

---

## 18. Kepatuhan dan Tata Kelola

Sebelum mengaktifkan integrasi finansial atau meluncurkan layanan secara komersial, lakukan kajian hukum dan kepatuhan sesuai model bisnis serta aktivitas yang benar-benar dijalankan.

Hal yang perlu ditinjau:
- Ketentuan perlindungan data pribadi di Indonesia.
- Kewajiban penyelenggara sistem elektronik jika berlaku.
- Ketentuan Bank Indonesia/OJK yang relevan dengan model integrasi dan aktivitas layanan.
- Perjanjian serta persyaratan penggunaan API mitra.
- Persetujuan pengguna dan transparansi tujuan pemrosesan.
- Kebijakan retensi, penghapusan, dan pemulihan data.
- Penanganan insiden keamanan.
- Ketentuan layanan AI pihak ketiga.

PRD ini bukan pendapat hukum dan tidak menyatakan bahwa Finora otomatis berhak mengakses rekening bank atau e-wallet. Kelayakan setiap integrasi harus dikonfirmasi kepada penyedia dan penasihat yang kompeten.

---

## 19. Keputusan Produk yang Menjadi Pegangan

1. Produk dimulai sebagai web app responsif.
2. Target awal adalah individu; dukungan keluarga menjadi pengembangan berikutnya.
3. Pencatatan manual menjadi fondasi MVP.
4. Impor CSV/XLSX menjadi jalur untuk data dari bank/e-wallet yang belum terintegrasi.
5. Integrasi otomatis hanya dilakukan melalui jalur resmi dan setelah persyaratan dipenuhi.
6. AI menjadi lapisan analisis, bukan sumber kebenaran angka keuangan.
7. PostgreSQL menjadi penyimpanan utama pada arsitektur awal.
8. Backend menjadi sumber kebenaran saldo, transaksi, dan laporan.
9. Semua fitur harus menjaga privasi dan keamanan data keuangan.
10. Fitur yang belum tersedia tidak boleh ditampilkan seolah-olah sudah berfungsi.

---

## 20. Instruksi untuk Pengembangan oleh AI Coding Agent

Sebelum menulis kode:

1. Baca seluruh PRD ini.
2. Periksa struktur repository dan teknologi yang sudah ada.
3. Jangan mengasumsikan fitur telah tersedia tanpa memeriksa kode.
4. Buat rencana implementasi per fase.
5. Identifikasi keputusan teknis yang belum ditentukan.
6. Rancang skema database dan aturan pembukuan sebelum membuat fitur transaksi.
7. Buat design system dan komponen UI yang konsisten.
8. Implementasikan fitur MVP terlebih dahulu.
9. Jangan membuat integrasi bank palsu atau menampilkan data contoh sebagai data rekening nyata.
10. Gunakan mock provider hanya di development dan beri label yang jelas.
11. Jangan menaruh API key, token, atau kredensial di frontend/repository.
12. Buat unit test untuk perhitungan saldo, transfer, anggaran, dan tabungan.
13. Buat integration test untuk autentikasi dan isolasi data antar pengguna.
14. Dokumentasikan endpoint, environment variables, migrasi, dan cara menjalankan proyek.
15. Setelah implementasi, bandingkan hasil dengan acceptance criteria dan laporkan fitur yang selesai, parsial, belum ada, serta bukti implementasinya.

### Aturan Implementasi

- Jangan mengerjakan semua fase sekaligus.
- Jangan menghapus atau mengganti struktur proyek yang sudah ada tanpa alasan dan persetujuan.
- Jangan membuat tombol atau menu yang tidak memiliki fungsi.
- Jangan menampilkan angka keuangan statis pada dashboard produksi.
- Jangan menggunakan floating point untuk perhitungan nominal uang.
- Jangan menganggap transfer antar-akun sebagai pengeluaran.
- Jangan mengirim seluruh data transaksi ke AI jika ringkasan sudah cukup.
- Jangan mengklaim integrasi aktif sebelum koneksi nyata diuji.
- Setiap fitur harus memiliki loading, empty, error, dan success state yang sesuai.
- Catat keputusan teknis dan perubahan scope.

### Output yang Diharapkan dari Agent

- Aplikasi berjalan secara lokal.
- Source code terstruktur.
- Database schema dan migration.
- Dokumentasi instalasi dan konfigurasi.
- Dokumentasi API.
- Test suite.
- `.env.example` tanpa secret.
- Daftar fitur berdasarkan status implementasi.
- Daftar risiko dan pekerjaan lanjutan.

---

## 21. Definisi Selesai (Definition of Done)

Sebuah fitur dinyatakan selesai jika:

- Kebutuhan dan perilakunya sesuai PRD.
- UI responsif dan konsisten.
- Validasi frontend dan backend tersedia.
- Otorisasi dan kepemilikan data diuji.
- Loading, empty, error, dan success state tersedia.
- Unit/integration test yang relevan lulus.
- Tidak ada secret di repository.
- Dokumentasi diperbarui.
- Tidak ada data contoh yang disamarkan sebagai data nyata.
- Fitur dapat didemonstrasikan melalui alur pengguna yang utuh.

---

**Akhir dokumen PRD Finora v1.0**

Dokumen ini menjadi sumber kebutuhan produk utama. Detail visual dapat dikembangkan dalam `DESIGN.md`, keputusan teknologi dalam `TECHSTACK.md`, alur pengguna dalam `FLOW.md`, dan instruksi agent dalam `AGENTS.md` setelah scope produk disepakati.
