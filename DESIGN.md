# DESIGN.md — Lamaranku mengikuti sistem JDS

> Arah ini disalin dari folder `jds` (Jaya Dinara Sukses) atas
> permintaan eksplisit pemilik, lalu diisi konten Lamaranku.
> R-30 tidak dilanggar karena peniruan diminta pemilik.
> Tanpa file ini, output agen cenderung default AI yang steril.

## Identitas dan suara

Lamaranku itu meja arsip, bukan panggung startup. Pengguna datang
dengan cemas (deadline lowongan). Bicara pendek, sebut angka batas
persis (2 CV, 3 surat per bulan), tidak berjanji lolos, tidak memuji
diri sendiri. Bahasa Indonesia sehari-hari, tanpa em dash (R-02),
tanpa emoji dekorasi, tanpa buzzword (R-16).

## Palet (2 inti + 1 aksen, R-29)

- Putih `#ffffff`: latar halaman. Alasan: halaman JDS terang,
  cocok dibaca siang hari dari HP.
- Zinc `#09090b`/`#52525b`/`#f4f4f5`: teks, teks sekunder, kartu.
  Alasan: rona netral JDS, kontras AA lolos.
- Hitam `#000000`/`#191919`: pita CTA, footer, tombol utama.
  Alasan: momen keputusan (bayar, mulai) diberi bobot paling gelap.
- Aksen tunggal biru `#1473E6` (hover `#1d4ed8`-ish `blue-700`):
  hanya untuk tombol utama dan penanda aktif. Alasan: satu warna
  tindakan agar tidak bersaing dengan hitam. Oranye `#ff6b35` hanya
  garis aksen, tidak pernah untuk teks.
- Hijau WA `#25D366`: hanya tombol chat mengambang. Alasan:
  affordance WhatsApp yang dikenali, diberi ring gelap agar batasnya
  lolos kontras non-teks 3:1.

Yang tidak dipakai: gradien biru-ungu, glow halaman, glass di mana-mana,
grid blueprint, orb. Alasan: tidak ada hubungannya dengan berkas
lamaran (R-01, R-07). Glow dan gradasi hanya di dalam hero foto/video
dan panel insight, mengikuti aslinya.

## Tipografi (R-06)

- Isi: Myriad Pro (400/600/700/900) via `next/font/local`,
  `font-sans`. Alasan: font rumah JDS, humanis dan terbaca di HP.
- Display: Myriad Pro Condensed, `font-display`. Alasan: judul
  padat gaya JDS.
- Judul section: `text-[28px] sm:text-[42px]` bold tracking-tight.
  Alasan: skala JDS, bukan skala default AI.
- Tidak ada label uppercase tracking lebar, tidak ada monospace
  sebagai gaya. Monospace hanya untuk contoh link.

## Sistem layout (R-05)

- Container `max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6`.
  Alasan: lebar khas JDS di semua section.
- Section landing: `py-12 lg:py-16`, heading `SectionHeading`
  (badge, judul, subjudul, tombol opsional). Alasan: ritme
  konsisten JDS.
- Kartu outcome: `bg-zinc-100 rounded-2xl`, hover jadi hitam
  dengan teks memutih, transisi 600ms. Alasan: interaksi khas JDS.
- Pita CTA gelap `#191919` dengan tombol pil biru + outline.
  Alasan: pola `TrustCta` JDS.
- Footer hitam: grid brand + Navigasi + Fitur + Kontak, akordeon
  di HP, bar bawah. Alasan: pola footer JDS.
- Navbar JDS: transparan di top (putih di atas hero gelap),
  jadi kartu blur putih saat scroll, link aktif ditandai,
  menu HP fullscreen dengan link besar. Alasan: perilaku asli JDS.
- Hero carousel JDS: slide full-screen autoplay 5,2 detik dengan
  wipe, judul raksasa, rel tab + progress bar, tombol jeda.
  Alasan: etalase 5 fitur dalam satu layar.
- Galeri template: lajur marquee kanan-ke-kiri (seperti referensi
  SuratPlus), berhenti saat hover/fokus, mati saat
  prefers-reduced-motion (R-19).

## Dial (Part 3)

Reading this as: halaman produk freemium untuk pencari kerja
Indonesia yang membuka dari HP, dalam bahasa visual JDS yang
bersih dan korporat, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

- ENERGY 2: menyapa jelas (carousel + headline besar) tanpa berteriak.
- RHYTHM 2: hero gelap, section terang, pita gelap, footer hitam.
- MOTION 1 untuk halaman dalam (hover dan fokus saja),
  MOTION 2 untuk landing (carousel + marquee + reveal sekali jalan).
  Tidak ada loop tanpa jeda kecuali autoplay yang bisa dijeda.

## Keputusan tercatat (R-31)

- Tanpa badge di atas H1: H1 sudah menyebut janji (R-09).
- Dua tingkat harga saja: produk memang hanya Basic dan Plus (R-05).
- Tanpa testimoni dan angka pengguna: bukan milik kita (R-17, R-18).
- AI dan skor berlabel segera hadir + contoh ilustrasi (R-38).
- Limit demo di localStorage ditulis apa adanya di copy (R-38).
- Harga Plus dan nomor WA menunggu konfirmasi pemilik sebelum tayang.
