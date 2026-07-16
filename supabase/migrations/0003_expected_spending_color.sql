-- Salary Battery — pastel color tag for expected spending entries
-- Run this in the Supabase SQL editor after 0002_household_members.sql.

-- color: an optional pastel hex value (e.g. '#fde2e2') the user picks to visually group/highlight
-- a spending entry in the UI. Null = default card appearance.
alter table monthly_expected_spending add column color text;
