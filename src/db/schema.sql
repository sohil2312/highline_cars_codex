create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  inspection_code text unique,
  status text default 'Draft',
  vehicle_reg_no text,
  make text,
  model text,
  variant text,
  year_of_manufacture integer,
  mileage_km integer,
  fuel_type text,
  color text,
  owners_count text,
  customer_name text,
  customer_phone text,
  inspection_city text,
  notes text,
  airbags_count integer,
  abs_present boolean,
  market_value numeric,
  health_score integer,
  recommendation text,
  exposure_percent integer,
  total_repair_min numeric,
  total_repair_max numeric,
  rc_front_path text,
  rc_back_path text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists inspection_legal (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid unique references inspections(id) on delete cascade,
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
  updated_at timestamptz default now()
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
  cost_severity integer,
  tread_depth text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (inspection_id, item_id)
);

create table if not exists inspection_media (
  id uuid primary key default gen_random_uuid(),
  inspection_item_id uuid references inspection_items(id) on delete cascade,
  media_type text,
  storage_path text,
  caption text,
  created_at timestamptz default now()
);

create table if not exists report_shares (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  token text unique,
  allow_pdf boolean default true,
  created_at timestamptz default now()
);

create table if not exists inspection_revisions (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid references inspections(id) on delete cascade,
  revision_number integer,
  data jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique (inspection_id, revision_number)
);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

create or replace trigger set_inspections_updated_at
before update on inspections
for each row execute function set_updated_at();

create or replace trigger set_inspection_legal_updated_at
before update on inspection_legal
for each row execute function set_updated_at();

create or replace trigger set_inspection_items_updated_at
before update on inspection_items
for each row execute function set_updated_at();

create index if not exists inspections_created_by_idx on inspections(created_by);
create index if not exists inspections_created_at_idx on inspections(created_at desc);
create index if not exists inspection_items_inspection_id_idx on inspection_items(inspection_id);
create index if not exists inspection_media_item_idx on inspection_media(inspection_item_id);
create index if not exists report_shares_token_idx on report_shares(token);
