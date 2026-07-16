-- Salary Battery — household members (multi-person support)
-- Run this in the Supabase SQL editor after 0001_init.sql.

create table household_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index household_members_user_id_idx on household_members (user_id);

alter table household_members enable row level security;

create policy "household_members_owner" on household_members
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger household_members_set_updated_at
  before update on household_members
  for each row execute function set_updated_at();

-- member_id: who this row belongs to. Null = shared (household), non-null = private to that person.
-- Kept nullable at the DB level (even for income, which is always personal in the UI) so that
-- `on delete set null` can succeed without fighting a NOT NULL constraint — an income row losing
-- its member on deletion just falls into an "Unassigned" bucket, a rare edge case.
alter table recurring_items add column member_id uuid references household_members (id) on delete set null;
alter table monthly_income_entries add column member_id uuid references household_members (id) on delete set null;
alter table monthly_expense_entries add column member_id uuid references household_members (id) on delete set null;
alter table monthly_expected_spending add column member_id uuid references household_members (id) on delete set null;

create index recurring_items_member_id_idx on recurring_items (member_id);
create index monthly_income_entries_member_id_idx on monthly_income_entries (member_id);
create index monthly_expense_entries_member_id_idx on monthly_expense_entries (member_id);
create index monthly_expected_spending_member_id_idx on monthly_expected_spending (member_id);
