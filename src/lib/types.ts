import type { Frequency } from '@/lib/calculations'

export type RecurringItemType = 'income' | 'fixed_expense'

export interface RecurringItem {
  id: string
  user_id: string
  type: RecurringItemType
  name: string
  category: string | null
  default_amount: number
  frequency: Frequency
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MonthlyPeriod {
  id: string
  user_id: string
  year: number
  month: number
  actual_saved_amount: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MonthlyIncomeEntry {
  id: string
  monthly_period_id: string
  user_id: string
  recurring_item_id: string | null
  name: string
  amount: number
  frequency: Frequency
  monthly_equivalent_amount: number
  is_extra: boolean
  created_at: string
}

export interface MonthlyExpenseEntry {
  id: string
  monthly_period_id: string
  user_id: string
  recurring_item_id: string | null
  name: string
  category: string | null
  amount: number
  frequency: Frequency
  monthly_equivalent_amount: number
  created_at: string
}

export interface MonthlyExpectedSpending {
  id: string
  monthly_period_id: string
  user_id: string
  category: string
  amount: number
  created_at: string
}
