-- sinnerThreads: кошики і замовлення.
-- Доступ тільки з сервера через secret/service-role ключ (він обходить RLS).
-- RLS увімкнено і політик немає, тому з браузера (publishable/anon ключ) ці таблиці недоступні.

create table if not exists public.carts (
  id          uuid primary key,
  lines       jsonb       not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Номери demo-замовлень йдуть з послідовності. У live-режимі id надає МійДроп.
create sequence if not exists public.order_demo_seq start 1001;

create table if not exists public.orders (
  id          bigint primary key default nextval('public.order_demo_seq'),
  mode        text        not null check (mode in ('demo', 'live')),
  status      text        not null check (status in ('awaiting_payment', 'paid', 'payment_failed', 'placed')),
  payment     text        not null check (payment in ('cod', 'card')),
  provider    text,
  total       integer     not null check (total >= 0),
  customer    jsonb       not null,
  lines       jsonb       not null,
  history     jsonb       not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists carts_updated_at_idx on public.carts (updated_at);

alter table public.carts  enable row level security;
alter table public.orders enable row level security;
-- Навмисно без create policy: анонімний і authenticated доступ закритий.
