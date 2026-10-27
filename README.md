# Lamaranku

Freemium web: CV Builder + Cek Skor CV + Portfolio Builder + Generator Surat.
Gratis untuk mulai, Plus untuk hasil maksimal tanpa watermark.

## Jalankan

```powershell
npm install
npm run dev
```

Buka http://localhost:3000

## Struktur

- `app/page.tsx` - landing + demo + harga
- `components/ComparisonTable.tsx` - tabel Basic vs Plus (desktop + mobile)
- `components/Builders.tsx` - demo CV (limit 2) + Surat (limit 3/bulan), watermark Basic
- `data/features.ts` - sumber tunggal spek fitur, ganti harga di `PLUS_PRICE` dan WA di `WA_NUMBER`
- `supabase/schema.sql` - skema Fase 2 (auth + langganan)

## Freemium saat ini (Fase 1)

Limit disimpan di localStorage, tanpa login:
- CV: Basic 2, Plus Unlimited
- Surat: Basic 3/bulan, Plus Unlimited
- AI + download bersih + custom link + rincian skor: Plus only

Toggle Mode Basic/Plus di hero untuk simulasi paywall.

Fase 2: pasang Supabase Auth + tabel di `supabase/schema.sql` + generate PDF server + QRIS manual.

## Dashboard dan alur login

- /dashboard: ringkasan ruang kerja; /dashboard/skor, /dashboard/cv-builder, /dashboard/portfolio, /dashboard/surat: alat masing-masing.
- Dashboard dilindungi Supabase Auth pada middleware dan layout server. API review CV juga memerlukan sesi login.
- Dari /skor, tombol Review CV menyimpan PDF dan deskripsi lowongan sementara di IndexedDB, lalu menuju dashboard. Login mempertahankan URL tujuan beserta parameter draft/template.
- Draft review berlaku satu jam di browser yang sama, dibersihkan setelah proses review, dan draft kedaluwarsa dibersihkan ketika diakses atau saat menyimpan draft berikutnya. Jika penyimpanan browser diblokir, pengguna mendapat pesan dan dapat mengunggah ulang.
- Form dashboard dimulai kosong. CV, portofolio, draft surat, kuota surat, dan deskripsi lowongan disimpan per ID akun pada browser yang sama; belum sinkron antarperangkat. Data lama tanpa pemilik tetap tersimpan di kunci lama dan tidak diklaim otomatis oleh akun yang login.
- Konfigurasi Gemini disimpan di .env.local (tidak masuk Git). Sesuaikan GEMINI_MODEL dengan model yang tersedia pada proyek AI Studio.
