# SEO Lamaranku

Implementasi menargetkan pencarian Indonesia yang relevan dengan fitur nyata:

| Halaman | Fokus |
| --- | --- |
| `/` | Buat CV ATS dan portofolio gratis |
| `/cv-builder` | CV builder gratis, bikin CV online, unduh PDF |
| `/cv-ats` | Panduan membuat CV ATS dan contoh isi pengalaman |
| `/portfolio` | Buat portofolio gratis online dan unduh PDF |
| `/skor` | Cek skor CV dan review CV dengan AI |
| `/surat` | Buat surat lamaran kerja online |
| `/harga` | Batas paket Basic gratis dan Plus |

Metadata, canonical, Open Graph, sitemap, robots, dan JSON-LD memakai satu domain publik dari `NEXT_PUBLIC_SITE_URL`. Default saat ini `https://lamaranku.vercel.app`. Ganti variabel ini jika memakai domain sendiri, lalu deploy ulang. Query filter/template memakai canonical halaman utama galeri, bukan URL baru untuk setiap variasi.

Halaman dashboard dan akun memakai `noindex`; URL dashboard, API, callback autentikasi, dan editor lama tidak masuk sitemap. Preview Vercel memakai `noindex`. Sitemap hanya berisi halaman publik yang memang tersedia, tanpa tanggal pembaruan buatan, rating palsu, atau halaman duplikat untuk variasi kata kunci.

Setelah deploy:

1. Pastikan domain produksi dapat dibuka tanpa login, status HTTP 200, dan tidak terpasang proteksi deployment untuk pengunjung umum.
2. Tambahkan properti domain atau URL-prefix yang sesuai di [Google Search Console](https://search.google.com/search-console). Untuk verifikasi HTML, isi `GOOGLE_SITE_VERIFICATION` dengan nilai token dari Google dan deploy ulang; verifikasi DNS dilakukan di penyedia domain jika memakai metode domain.
3. Kirim `https://lamaranku.vercel.app/sitemap.xml` (sesuaikan jika domain berubah). Inspeksi URL beranda, `/cv-builder`, `/cv-ats`, dan `/portfolio`, lalu minta pengindeksan.
4. Pantau laporan pengindeksan, kueri, klik, dan Core Web Vitals. Perbarui panduan berdasarkan pertanyaan pengguna dan fitur yang sudah benar-benar tersedia.

Konten panduan tidak menjamin lolos ATS. Metadata dan structured data juga tidak menjamin peringkat pertama atau tampilan khusus di Google. Hasil pencarian bergantung pada relevansi, kualitas situs, persaingan, dan pengindeksan.

Rujukan: [Google Search Essentials](https://developers.google.com/search/docs/essentials), [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [aturan structured data](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
