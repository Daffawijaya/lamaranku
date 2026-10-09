# Lamaranku

Freemium web: CV Builder + Generator Surat + Portfolio Website + Career Academy.
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
- AI + download bersih + custom link + sertifikat: Plus only (tombol 🔒)

Toggle Mode Basic/Plus di hero untuk simulasi paywall.

Fase 2: pasang Supabase Auth + tabel di `supabase/schema.sql` + generate PDF server + QRIS manual.
