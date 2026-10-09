# DESIGN.md — Lamaranku

> Catatan jujur: arah ini dirumuskan agen dari isi produk (berkas lamaran kerja Indonesia),
> bukan dari riset brand milikmu. Kalau ada yang tidak cocok, ubah file ini, karena
> selera bawaan agen cenderung ke default AI. (R-37)

## Identitas

Lamaranku itu meja arsip, bukan panggung startup. Pengguna datang dengan cemas
(dealline lowongan), tugas kita membuat berkas terasa rapi dan terkendali.
Visualnya kertas dan stempel, bukan kaca dan cahaya.

## Kepribadian

Petugas arsip yang teliti: bicara pendek, menyebut angka batas persis
(2 CV, 3 surat/bulan), tidak berjanji lolos, tidak memuji diri sendiri.

## Palet (2 inti + 1 aksen, R-29)

- Kertas `#F5EFE3`: latar. Alasan: berkas lamaran hidup di atas kertas,
  bukan kanvas gelap. Kontras tinta di atasnya 15.22, lolos AA.
- Tinta `#1A1A18`: teks dan bingkai. Alasan: warna dokumen resmi,
  kontras 17.43 di atas putih.
- Hijau materai `#1B5E3B`: warna tindakan utama dan status Plus.
  Alasan: materai dan stempel lunas di Indonesia berwarna hijau tua.
  Putih di atasnya 7.75, lolos AA.
- Aksen tunggal merah stempel `#8A1F1F`: hanya untuk momen bayar
  (paywall, batas habis). Alasan: stempel "kurang" dan "ditolak" berwarna
  merah. Tidak dipakai di tempat lain. Putih di atasnya 9.14.
- Abu `#5B5B55`: teks sekunder saja. Putih di atasnya 6.83, lolos AA.

Yang tidak dipakai: gradien biru-ungu, glow, glass, grid blueprint, orb.
Alasan: tidak ada hubungannya dengan berkas lamaran (R-01, R-07).

## Tipografi (R-06)

- Judul: Georgia, serif. Alasan: kepala surat lamaran resmi memakai serif.
- Isi dan tombol: system sans. Alasan: keterbacaan di HP kecil.
- Tidak ada label uppercase dengan tracking lebar, tidak ada monospace
  sebagai gaya. Monospace hanya untuk contoh link (`lamaranku.id/nama`).

## Motif identitas

Bingkai berkas: garis 1px tinta + sudut 10px + nomor urut bagian
("Berkas 01", "Berkas 02"). Satu motif ini diulang di semua bagian,
itu yang membuat halaman ini milik Lamaranku dan bukan template.

## Dial (Part 3)

Reading this as: halaman produk freemium untuk pencari kerja Indonesia
yang membuka dari HP, dalam bahasa visual dokumen kertas,
dial ENERGY 1 / RHYTHM 2 / MOTION 1.

- ENERGY 1: tenang. Satu kabar per layar, tidak ada yang berteriak.
- RHYTHM 2: konsisten dengan jeda. Demo berbentuk meja kerja dua kolom,
  tabel berbentuk arsip, harga berbentuk dua surat keputusan.
  Tidak ada dua bagian dengan komposisi sama persis.
- MOTION 1: hanya hover dan fokus. Tidak ada loop, tidak ada reveal
  saat scroll. Alasan: pengguna cemas tidak butuh gerak tambahan (R-19).

## Keputusan tercatat (R-31)

- Latar terang kertas, bukan gelap: produk dibaca siang hari dari HP,
  tidak ada alasan produk untuk gelap (R-21).
- Tanpa badge di atas H1: H1 sudah menyebut janji, badge hanya mengulang (R-09).
- Alur 4 langkah sebagai daftar bernomor, bukan 3 kartu ikon:
  proses asli memang 4 (isi, preview, simpan, bayar saat butuh) (R-05).
- Dua tingkat harga saja: produk memang hanya punya Basic dan Plus (R-05).
- Sorot Plus dengan bingkai tebal + pita "dipilih pencari kerja",
  bukan badge kapsul "paling laris": sorotan menandai pilihan yang
  menghidupi produk, alasannya ditulis di kartu.
- Watermark demo berupa pita diagonal teks, bukan logo: menandai hasil
  Basic apa adanya, bukan aset final (R-23, R-38).

## Amandemen: bahasa visual biru (atas permintaan pemilik)

Pemilik meminta landing meniru susunan dan bahasa visual halaman
CV builder SuratPlus. Ini pengecualian R-30 yang eksplisit diminta,
bukan default agen. Yang ditiru: urutan bagian, komposisi hero dua
kolom, galeri kartu, panel ATS lawan Kreatif, 3 langkah, pita AI,
grid fitur, FAQ dua kolom, CTA biru, footer biru, tombol WA mengambang.

Yang tidak ditiru: teks mereka (semua kalimat ditulis ulang dari fakta
Lamaranku), foto dan mockup mereka (diganti render asli builder),
angka pengguna dan testimoni (dihilangkan, R-17/R-18), klaim AI dan skor
yang belum dibangun (pita AI berlabel segera hadir, R-38).

Token: biru primer `#155bd5` untuk tindakan dan sorotan (putih di
atasnya 6.02, lolos AA), oranye `#ff6b35` hanya untuk garis aksen
bukan teks, pil untuk kontrol navigasi dan filter, rounded-xl untuk
tombol, rounded-2xl/3xl untuk wadah. Marquee galeri beralasan
menampilkan banyak template dalam ruang kecil, berhenti saat hover
atau fokus, mati saat prefers-reduced-motion (R-19).
