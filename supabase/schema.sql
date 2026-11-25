-- ---------------------------------------------------------------------------
-- Turvanotopweb — Supabase schema
--
-- Access model: the Next.js server is the only client. It talks to Postgres
-- with the service_role key (see lib/supabase/server.ts), so every table below
-- is created with RLS enabled and *no* policies. That denies anon/authenticated
-- through the Data API while service_role keeps full access.
--
-- Default rows (settings + products) are seeded by the app on first use, so the
-- catalog and admin defaults live in one place: lib/admin-defaults.ts.
--
-- Tabel diberi awalan `turvano_` karena project Supabase ini dipakai bersama
-- brand lain (tabel `orders`, `products`, `settings` miliknya sudah ada).
--
-- Re-runnable: every statement is idempotent.
-- ---------------------------------------------------------------------------

-- --------------------------------- Orders ---------------------------------
create table if not exists public.turvano_orders (
  id               text primary key,
  category         text not null,
  category_slug    text not null,
  provider         text not null default '',
  product          text not null,
  customer         text not null,
  total            integer not null default 0,
  total_formatted  text not null default '',
  payment_method   text not null default 'QRIS',
  created_at       text not null default '',
  sn               text not null default '',
  status           text not null default 'WAITING'
                     constraint turvano_orders_status_check
                     check (status in ('SUCCESS', 'PENDING', 'WAITING', 'FAILED')),
  status_label     text not null default '',
  system_message   text not null default '',
  created_ts       timestamptz not null default now()
);

-- Newest-first listing in the admin console + tracker.
create index if not exists turvano_orders_created_ts_idx on public.turvano_orders (created_ts desc);
create index if not exists turvano_orders_status_idx on public.turvano_orders (status);

-- -------------------------------- Products --------------------------------
create table if not exists public.turvano_products (
  id             text primary key,
  category_slug  text not null,
  category_name  text not null,
  name           text not null,
  price          integer not null default 0,
  note           text not null default '',
  provider       text not null default '',
  active         boolean not null default true,
  -- Preserves the admin console's manual ordering of the catalog.
  sort_order     integer not null default 0
);

create index if not exists turvano_products_category_slug_idx on public.turvano_products (category_slug);
create index if not exists turvano_products_sort_order_idx on public.turvano_products (sort_order);

-- -------------------------------- Settings --------------------------------
-- Single-row config table; the AdminSettings blob is stored as typed columns
-- plus two jsonb arrays for the nested bank / e-wallet account lists.
create table if not exists public.turvano_settings (
  id                        integer primary key
                              constraint turvano_settings_singleton check (id = 1),
  whatsapp_number           text not null default '',
  whatsapp_admin_name       text not null default '',
  whatsapp_hours            text not null default '',
  whatsapp_template_order   text not null default '',
  whatsapp_template_success text not null default '',
  qris_image                text not null default '',
  qris_merchant             text not null default '',
  qris_nmid                 text not null default '',
  qris_active               boolean not null default true,
  qris_instructions         text not null default '',
  banks                     jsonb not null default '[]'::jsonb,
  ewallets                  jsonb not null default '[]'::jsonb,
  admin_fee_bill            integer not null default 2500,
  updated_at                timestamptz not null default now()
);

-- --------------------------- Lock down the tables --------------------------
alter table public.turvano_orders enable row level security;
alter table public.turvano_products enable row level security;
alter table public.turvano_settings enable row level security;

-- RLS enabled with no policies already blocks anon/authenticated; revoking the
-- default grants keeps them out of the Data API entirely (defence in depth).
revoke all on public.turvano_orders, public.turvano_products, public.turvano_settings from anon, authenticated;

-- ---------------------------- Penyimpanan gambar ---------------------------
-- Foto QRIS dari dashboard admin. Bucket publik supaya gambar bisa tampil di
-- halaman checkout; menulis dan menghapus hanya lewat server (service_role),
-- jadi tidak ada policy untuk anon/authenticated.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('turvano-assets', 'turvano-assets', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
