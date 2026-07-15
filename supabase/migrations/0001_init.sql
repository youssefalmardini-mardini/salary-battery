-- Salary Battery — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- recurring_items: reusable templates for income sources & fixed payments
-- ---------------------------------------------------------------------------
create table recurring_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'fixed_expense')),
  name text not null,
  category text,
  default_amount numeric(12, 2) not null check (default_amount >= 0),
  frequency text not null check (frequency in ('monthly', 'weekly', 'biweekly', 'yearly')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recurring_items_user_id_idx on recurring_items (user_id);

-- ---------------------------------------------------------------------------
-- monthly_periods: one row per user per calendar month = "one calculation"
-- ---------------------------------------------------------------------------
create table monthly_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  actual_saved_amount numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

create index monthly_periods_user_id_idx on monthly_periods (user_id);

-- ---------------------------------------------------------------------------
-- monthly_income_entries: salary + extra income for a given month
-- ---------------------------------------------------------------------------
create table monthly_income_entries (
  id uuid primary key default gen_random_uuid(),
  monthly_period_id uuid not null references monthly_periods (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  recurring_item_id uuid references recurring_items (id) on delete set null,
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  frequency text not null check (frequency in ('monthly', 'weekly', 'biweekly', 'yearly')),
  monthly_equivalent_amount numeric(12, 2) not null check (monthly_equivalent_amount >= 0),
  is_extra boolean not null default false,
  created_at timestamptz not null default now()
);

create index monthly_income_entries_period_idx on monthly_income_entries (monthly_period_id);
create index monthly_income_entries_user_id_idx on monthly_income_entries (user_id);

-- ---------------------------------------------------------------------------
-- monthly_expense_entries: fixed payments applied to a given month
-- ---------------------------------------------------------------------------
create table monthly_expense_entries (
  id uuid primary key default gen_random_uuid(),
  monthly_period_id uuid not null references monthly_periods (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  recurring_item_id uuid references recurring_items (id) on delete set null,
  name text not null,
  category text,
  amount numeric(12, 2) not null check (amount >= 0),
  frequency text not null check (frequency in ('monthly', 'weekly', 'biweekly', 'yearly')),
  monthly_equivalent_amount numeric(12, 2) not null check (monthly_equivalent_amount >= 0),
  created_at timestamptz not null default now()
);

create index monthly_expense_entries_period_idx on monthly_expense_entries (monthly_period_id);
create index monthly_expense_entries_user_id_idx on monthly_expense_entries (user_id);

-- ---------------------------------------------------------------------------
-- monthly_expected_spending: variable/estimated spending, entered fresh each month
-- ---------------------------------------------------------------------------
create table monthly_expected_spending (
  id uuid primary key default gen_random_uuid(),
  monthly_period_id uuid not null references monthly_periods (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index monthly_expected_spending_period_idx on monthly_expected_spending (monthly_period_id);
create index monthly_expected_spending_user_id_idx on monthly_expected_spending (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — every table is private to its owning user
-- ---------------------------------------------------------------------------
alter table recurring_items enable row level security;
alter table monthly_periods enable row level security;
alter table monthly_income_entries enable row level security;
alter table monthly_expense_entries enable row level security;
alter table monthly_expected_spending enable row level security;

create policy "recurring_items_owner" on recurring_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "monthly_periods_owner" on monthly_periods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "monthly_income_entries_owner" on monthly_income_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "monthly_expense_entries_owner" on monthly_expense_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "monthly_expected_spending_owner" on monthly_expected_spending
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recurring_items_set_updated_at
  before update on recurring_items
  for each row execute function set_updated_at();

create trigger monthly_periods_set_updated_at
  before update on monthly_periods
  for each row execute function set_updated_at();
