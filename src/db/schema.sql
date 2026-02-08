-- Highline Cars inspection schema (Supabase Postgres)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','inspector')),
  full_name text,
  created_at timestamptz default now()
);

create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  inspection_code text unique,
  status text not null default 'Draft' check (status in ('Draft','Final')),
  vehicle_reg_no text,
  make text,
  model text,
  variant text,
  year_of_manufacture int,
  mileage_km int,
  fuel_type text,
  color text,
  owners_count text,
  customer_name text,
  customer_phone text,
  inspection_city text,
  notes text,
  airbags_count int,
  abs_present boolean,
  market_value numeric,
  health_score int,
  recommendation text,
  exposure_percent numeric,
  total_repair_min numeric,
  total_repair_max numeric,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists inspections_created_by_idx on inspections(created_by);
create index if not exists inspections_created_at_idx on inspections(created_at);

create table if not exists inspection_legal (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  insurance_type text,
  insurance_expiry date,
  rc_availability text,
  rc_condition text,
  hypothecation boolean,
  fitness_valid_till date,
  road_tax_paid boolean,
  road_tax_valid_till date,
  vin_embossing text,
  rc_mismatch boolean,
  to_be_scrapped boolean,
  duplicate_key boolean,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (inspection_id)
);

create table if not exists inspection_items (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  category_id text,
  item_id text,
  item_label text,
  item_type text,
  status text,
  work_done text,
  notes text,
  cost_severity int,
  tread_depth text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (inspection_id, item_id)
);

create table if not exists inspection_media (
  id uuid primary key default gen_random_uuid(),
  inspection_item_id uuid references inspection_items(id) on delete cascade,
  media_type text check (media_type in ('photo','video')),
  storage_path text not null,
  caption text,
  created_at timestamptz default now()
);

create table if not exists report_shares (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  token text unique not null,
  allow_pdf boolean default true,
  created_at timestamptz default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean default true,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists branding (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  address text,
  email text,
  phone text,
  cin text,
  logo_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists inspection_revisions (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  revision_number int not null,
  data jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table inspections enable row level security;
alter table inspection_legal enable row level security;
alter table inspection_items enable row level security;
alter table inspection_media enable row level security;
alter table report_shares enable row level security;
alter table inspection_revisions enable row level security;

-- RLS policies (inspectors can see their own, admins can see all)
create policy "inspectors read own inspections" on inspections
  for select using (created_by = auth.uid() or exists (
    select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

create policy "inspectors write own inspections" on inspections
  for all using (created_by = auth.uid() or exists (
    select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

create policy "inspectors read own legal" on inspection_legal
  for select using (
    inspection_id in (select id from inspections where created_by = auth.uid())
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "inspectors write own legal" on inspection_legal
  for all using (
    inspection_id in (select id from inspections where created_by = auth.uid())
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "inspectors read own items" on inspection_items
  for select using (
    inspection_id in (select id from inspections where created_by = auth.uid())
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "inspectors write own items" on inspection_items
  for all using (
    inspection_id in (select id from inspections where created_by = auth.uid())
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "inspectors read own media" on inspection_media
  for select using (
    inspection_item_id in (select id from inspection_items where inspection_id in (select id from inspections where created_by = auth.uid()))
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "inspectors write own media" on inspection_media
  for all using (
    inspection_item_id in (select id from inspection_items where inspection_id in (select id from inspections where created_by = auth.uid()))
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "share links read" on report_shares
  for select using (true);

create policy "inspectors create share" on report_shares
  for insert with check (
    inspection_id in (select id from inspections where created_by = auth.uid())
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "inspectors update share" on report_shares
  for update using (
    inspection_id in (select id from inspections where created_by = auth.uid())
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "inspectors write revisions" on inspection_revisions
  for insert with check (
    inspection_id in (select id from inspections where created_by = auth.uid())
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "inspectors read revisions" on inspection_revisions
  for select using (
    inspection_id in (select id from inspections where created_by = auth.uid())
    or exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );
