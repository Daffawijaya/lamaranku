# Akses perbaikan CV Plus

Endpoint `/api/skor/perbaiki` memeriksa sesi Supabase dan `app_metadata` pengguna
di server. Flag Plus di localStorage atau `user_metadata` tidak memberi akses.

Setelah pembayaran dikonfirmasi, admin dapat menjalankan SQL berikut di Supabase
SQL Editor, mengganti UUID dan tanggal berakhir sesuai transaksi:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('plan', 'plus', 'plus_until', '2026-12-01T00:00:00Z')
where id = 'UUID-PENGGUNA';
```

`plus_until` wajib berupa tanggal ISO yang masih berlaku. Nilai `null` berarti
akses Plus tanpa kedaluwarsa. Untuk mencabut akses, ubah `plan` menjadi `basic`.
Pengguna perlu memuat ulang halaman untuk memperbarui tombol; server selalu
memeriksa akses setiap permintaan.

Perbaikan memerlukan `GEMINI_API_KEY` dan memakai konfigurasi model review yang
sama. PDF dan DOCX diproses dalam memori, tidak disimpan ke database/storage.

Sebelum revisi, UI meminta `action=questions` untuk menanyakan maksimal enam
fakta yang belum ada, berdasarkan prioritas review dan paragraf yang bisa diedit.
Pengguna dapat menjawab atau melewati setiap pertanyaan. Jawaban dikirim sebagai
`answers` pada permintaan revisi, terikat pada `segmentId`. Angka baru hanya boleh
berasal dari jawaban untuk paragraf tersebut; angka asli harus tetap dipertahankan.
Pertanyaan yang dilewati tidak memberikan izin untuk menambah fakta.

UI selanjutnya mengirim `action=propose`. Tahap ini hanya mengembalikan teks
asli dan usulan per bagian, tanpa menulis dokumen. Pengguna memilih Ya/Tidak
untuk setiap usulan. `action=apply` menerima hanya daftar `approved` yang dipilih,
memastikan ID dan teks asli cocok dengan dokumen, lalu menulis teks persis sesuai
pilihan tanpa memanggil AI lagi. Persetujuan per bagian mengizinkan perubahan
fakta pada bagian tersebut; bagian yang ditolak tetap memakai teks asli.

PDF dikonversi otomatis ke DOCX sebelum direvisi AI. PDFium membaca posisi
karakter, termasuk teks dalam Form XObjects, lalu menyusunnya sebagai teks Word
editable di dalam text box. Ukuran halaman, posisi, ukuran font, warna, dan
alignment diperkirakan dari sumber. Garis, gambar, dan elemen nonteks dirender
sebagai latar halaman; objek teks asli disembunyikan agar tidak tercetak ganda.
Font pengganti dan tata letak Word dapat menyebabkan perbedaan dari PDF asli.
PDF scan atau teks outline masih memerlukan OCR. Semua hasil endpoint kini
berupa DOCX, termasuk jika klien lama mengirim layout original/rebuild.

DOCX dibaca sebagai paket OOXML dengan batas ukuran hasil dekompresi. AI hanya
mengubah paragraf yang dapat diedit dengan aman dan memiliki format run seragam.
Paragraf dengan format campuran, tautan, field, gambar, atau tracked changes
dilewati. Aset, styles, header/footer, tabel, border, alignment, dan pengaturan
halaman dipertahankan. Revisi yang mengubah angka/kontak tanpa konfirmasi dari
sumber dilewati. Kalimat yang lebih panjang tetap diterapkan. Hasil tetap DOCX editable; perubahan teks dapat menggeser baris
atau halaman sehingga pengguna perlu memeriksa hasil di Word/Google Docs.

Review mengekstrak teks DOCX secara lokal setelah login, termasuk teks tabel dan
header/footer. Jumlah halaman DOCX dikirim sebagai null, bukan perkiraan.
Pratinjau DOCX di aplikasi berupa teks, bukan render tata letak Word.
Tidak ada janji semua saran review dapat diterapkan secara otomatis.

Dependensi `@embedpdf/pdfium` menggunakan MIT; PDFium yang disertakan memakai
lisensi Apache 2.0. WASM disertakan dalam output tracing Next.js untuk endpoint.
