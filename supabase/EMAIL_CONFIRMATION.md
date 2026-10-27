# Konfirmasi email

1. Deploy kode yang memuat `/auth/confirm` dan `/auth/confirmed`.
2. Jalankan `email-confirmation.sql` pada database proyek yang sama dengan aplikasi.
3. Supabase Authentication → URL Configuration: Site URL harus memakai alamat
   produksi HTTPS (misalnya `https://lamaranku.vercel.app`).
4. Supabase Authentication → Emails → Templates → Confirm sign up: gunakan isi
   `confirm-signup-email.html`. Tautan harus menuju aplikasi dengan `TokenHash`,
   bukan `ConfirmationURL`, supaya dapat dibuka di perangkat lain tanpa PKCE
   verifier milik browser asal.
5. Gunakan email konfirmasi baru untuk menguji perubahan template.

Route memverifikasi token sekali pakai melalui `verifyOtp`, lalu menampilkan
halaman berhasil atau gagal. Route tidak menyimpan sesi login ke browser.
Halaman pendaftaran memeriksa status setiap lima detik selama tab terlihat dan
ketika tab aktif kembali. Status hanya bisa dibaca dengan UUID akun dan UUID
konfirmasi acak yang dibuat saat pendaftaran; fungsi tidak mengembalikan data
akun. Setelah terkonfirmasi, layar berhasil tampil 2,5 detik lalu kembali ke form
login dengan email tetap terisi dan password kosong. Tujuan fitur dalam `next`
tetap dipertahankan pada halaman pendaftaran.
