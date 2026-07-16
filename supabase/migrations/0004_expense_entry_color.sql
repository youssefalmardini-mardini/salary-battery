-- Salary Battery — pastel color tag for fixed expense entries
-- Run this in the Supabase SQL editor after 0003_expected_spending_color.sql.

-- color: an optional pastel hex value (e.g. '#fde2e2') the user picks to visually group/highlight
-- a fixed payment entry in the UI. Null = default card appearance.
alter table monthly_expense_entries add column color text;
