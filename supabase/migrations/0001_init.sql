-- MyCellar — schema inicial
-- Tabelas: profiles, shelves, bottles, scan_usage
-- RLS: isolamento multi-tenant, cada usuário só acessa seus próprios dados

-- =========================================================
-- profiles: perfil + preferências + aceite de termos
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  background_image_url text,
  display_mode text not null default 'illustrated' check (display_mode in ('illustrated','photo')),
  preferred_language text not null default 'pt-BR' check (preferred_language in ('pt-BR','en','es')),
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- shelves: metadados de cada prateleira (não uma linha por slot)
-- =========================================================
create table public.shelves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shelf_index int not null,          -- ordem de exibição, 0-based
  name text,                         -- rótulo opcional, ex "Prateleira A"
  capacity int not null check (capacity > 0),
  slot_positions jsonb not null default '[]',  -- [{x,y} em % da imagem], usado só no modo foto
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, shelf_index)
);

-- =========================================================
-- bottles: uma linha = uma garrafa física
-- =========================================================
create table public.bottles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  wine_type text not null check (wine_type in ('tinto','branco','rose','espumante','fortificado','outro')),
  grapes text[],
  country text,
  region text,
  winery text,
  vintage_year int check (vintage_year between 1900 and 2100),

  label_photo_url text,
  rating numeric(2,1) check (rating between 0 and 5),
  tasting_notes text,

  shelf_id uuid references public.shelves(id) on delete set null,
  slot_index int,

  status text not null default 'active' check (status in ('active','consumed')),
  consumed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shelf_slot_pair_check check ((shelf_id is null) = (slot_index is null))
);

-- só uma garrafa ativa por slot físico
create unique index uniq_active_slot on public.bottles (shelf_id, slot_index)
  where status = 'active' and shelf_id is not null;

create index idx_bottles_user_status on public.bottles (user_id, status);

-- =========================================================
-- scan_usage: controle de custo da IA de rótulo, um contador por usuário/dia
-- =========================================================
create table public.scan_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_date date not null default current_date,
  count int not null default 0,
  primary key (user_id, scan_date)
);

-- =========================================================
-- Trigger de validação cruzada: slot dentro da capacidade da prateleira,
-- prateleira pertence ao mesmo usuário da garrafa (CHECK não alcança outra tabela)
-- =========================================================
create or replace function public.validate_bottle_slot()
returns trigger language plpgsql as $$
declare
  shelf_cap int;
  shelf_owner uuid;
begin
  if new.shelf_id is not null then
    select capacity, user_id into shelf_cap, shelf_owner
    from public.shelves where id = new.shelf_id;

    if shelf_owner is null or shelf_owner <> new.user_id then
      raise exception 'Shelf does not belong to this user';
    end if;
    if new.slot_index < 0 or new.slot_index >= shelf_cap then
      raise exception 'slot_index out of range for shelf capacity';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_validate_bottle_slot
  before insert or update on public.bottles
  for each row execute function public.validate_bottle_slot();

-- =========================================================
-- Auto-criação de perfil no signup
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- updated_at automático em shelves/bottles
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_shelves_updated_at
  before update on public.shelves
  for each row execute function public.set_updated_at();

create trigger trg_bottles_updated_at
  before update on public.bottles
  for each row execute function public.set_updated_at();

-- =========================================================
-- Row Level Security — isolamento multi-tenant
-- =========================================================
alter table public.profiles   enable row level security;
alter table public.shelves    enable row level security;
alter table public.bottles    enable row level security;
alter table public.scan_usage enable row level security;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

create policy "shelves_select_own" on public.shelves for select using (user_id = auth.uid());
create policy "shelves_insert_own" on public.shelves for insert with check (user_id = auth.uid());
create policy "shelves_update_own" on public.shelves for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "shelves_delete_own" on public.shelves for delete using (user_id = auth.uid());

create policy "bottles_select_own" on public.bottles for select using (user_id = auth.uid());
create policy "bottles_insert_own" on public.bottles for insert with check (user_id = auth.uid());
create policy "bottles_update_own" on public.bottles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bottles_delete_own" on public.bottles for delete using (user_id = auth.uid());

-- scan_usage só é lido pelo dono; escrita acontece via Edge Function com service role (bypassa RLS)
create policy "scan_usage_select_own" on public.scan_usage for select using (user_id = auth.uid());

-- =========================================================
-- Storage buckets + políticas
-- =========================================================
insert into storage.buckets (id, name, public)
values ('label-photos', 'label-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cellar-photos', 'cellar-photos', false)
on conflict (id) do nothing;

create policy "label_photos_owner_rw" on storage.objects
  for all using (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'label-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "cellar_photos_owner_rw" on storage.objects
  for all using (bucket_id = 'cellar-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'cellar-photos' and (storage.foldername(name))[1] = auth.uid()::text);
