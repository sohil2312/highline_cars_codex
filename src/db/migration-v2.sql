-- Migration V2: Company settings, checklist templates, and schema extensions
-- Run this after the initial schema.sql

-- 1. Company Settings table
create table if not exists company_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Highline Cars',
  logo_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger set_company_settings_updated_at
before update on company_settings
for each row execute function set_updated_at();

-- Seed default row
insert into company_settings (company_name)
select 'Highline Cars'
where not exists (select 1 from company_settings);

-- 2. Checklist Templates table
create table if not exists checklist_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version integer not null default 1,
  is_default boolean not null default false,
  categories jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace trigger set_checklist_templates_updated_at
before update on checklist_templates
for each row execute function set_updated_at();

create index if not exists checklist_templates_is_default_idx on checklist_templates(is_default);

-- 3. Extend inspections table
alter table inspections add column if not exists template_id uuid references checklist_templates(id);
alter table inspections add column if not exists cached_pdf_path text;
alter table inspections add column if not exists body_type text;
alter table inspections add column if not exists transmission text;
alter table inspections add column if not exists vin text;
alter table inspections add column if not exists stock_photo_path text;

create index if not exists inspections_template_id_idx on inspections(template_id);

-- 4. Add profile column to report_shares
alter table report_shares add column if not exists profile text default 'full';

-- Add check constraint (wrapped in DO block to handle existing constraint)
do $$
begin
  alter table report_shares add constraint report_shares_profile_check
    check (profile in ('full', 'customer', 'summary'));
exception
  when duplicate_object then null;
end $$;

-- 5. Enforce role values on profiles
do $$
begin
  alter table profiles add constraint profiles_role_check
    check (role in ('admin', 'inspector'));
exception
  when duplicate_object then null;
end $$;
