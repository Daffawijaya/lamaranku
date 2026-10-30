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
sama. PDF diproses dalam memori server, tidak disimpan ke database/storage.
PDF asli tidak ditimpa. PDFium mengubah objek teks asli: font, warna, posisi,
ukuran halaman, gambar, dan tautan tetap dipertahankan. Revisi yang melewati
batas objek teks atau tidak dapat ditulis dengan font asli dilewati. PDF scan,
teks yang dikonversi ke outline, serta teks di dalam Form XObjects belum dapat
diedit. Tidak ada janji semua saran review dapat diterapkan secara otomatis.

Dependensi `@embedpdf/pdfium` menggunakan MIT; PDFium yang disertakan memakai
lisensi Apache 2.0. WASM disertakan dalam output tracing Next.js untuk endpoint.
