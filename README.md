# Turvanotopweb

Platform transaksi digital untuk pulsa, paket data, uang elektronik, PLN, dan pembayaran berbagai tagihan. Dibangun dengan Next.js (App Router) + TypeScript.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env.local`, lalu isi nilainya.
2. `npm install`
3. `npm run dev`

## Supabase

Project Supabase ini dipakai bersama brand lain, jadi tabel brand ini diberi awalan `turvano_`
(`turvano_orders`, `turvano_products`, `turvano_settings`). Skemanya ada di `supabase/schema.sql`
(sekali jalan per project). Semua tabel terkunci RLS tanpa policy: hanya server yang mengaksesnya
lewat `SUPABASE_SERVICE_ROLE_KEY`, jadi kunci itu wajib diisi dan tidak boleh diberi awalan `NEXT_PUBLIC_`.

Katalog dan pengaturan bawaan (`lib/catalog.ts`, `lib/admin-defaults.ts`) otomatis di-seed ke tabel
pada permintaan pertama. Rekening bank dan akun e-wallet bawaan sengaja kosong dan nonaktif; isi dan
aktifkan lewat dashboard admin.

## Admin

`/admin` dilindungi satu password (`ADMIN_PASSWORD`) dengan sesi bertanda tangan (`ADMIN_SESSION_SECRET`).
Gambar QRIS diunggah lewat `/api/admin/upload` ke bucket Supabase Storage `turvano-assets`
(publik untuk dibaca, tulis hanya lewat server), jadi tidak butuh layanan gambar tambahan.
