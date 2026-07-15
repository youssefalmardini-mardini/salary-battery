import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { toMonthlyEquivalent } from '@/lib/calculations'
import type { MonthlyPeriod, RecurringItem } from '@/lib/types'

function periodKey(year: number, month: number) {
  return ['monthly_period', year, month] as const
}

async function fetchActiveRecurringItems(): Promise<RecurringItem[]> {
  const { data, error } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

async function seedMonthFromTemplates(userId: string, periodId: string) {
  const templates = await fetchActiveRecurringItems()
  const incomeTemplates = templates.filter((item) => item.type === 'income')
  const expenseTemplates = templates.filter((item) => item.type === 'fixed_expense')

  if (incomeTemplates.length > 0) {
    const rows = incomeTemplates.map((item, index) => ({
      monthly_period_id: periodId,
      user_id: userId,
      recurring_item_id: item.id,
      name: item.name,
      amount: item.default_amount,
      frequency: item.frequency,
      monthly_equivalent_amount: toMonthlyEquivalent(item.default_amount, item.frequency),
      is_extra: index > 0,
    }))
    const { error } = await supabase.from('monthly_income_entries').insert(rows)
    if (error) throw error
  }

  if (expenseTemplates.length > 0) {
    const rows = expenseTemplates.map((item) => ({
      monthly_period_id: periodId,
      user_id: userId,
      recurring_item_id: item.id,
      name: item.name,
      category: item.category,
      amount: item.default_amount,
      frequency: item.frequency,
      monthly_equivalent_amount: toMonthlyEquivalent(item.default_amount, item.frequency),
    }))
    const { error } = await supabase.from('monthly_expense_entries').insert(rows)
    if (error) throw error
  }
}

async function ensureMonthlyPeriod(userId: string, year: number, month: number): Promise<MonthlyPeriod> {
  const { data: existing, error: selectError } = await supabase
    .from('monthly_periods')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()
  if (selectError) throw selectError
  if (existing) return existing

  const { data: created, error: insertError } = await supabase
    .from('monthly_periods')
    .insert({ user_id: userId, year, month })
    .select('*')
    .single()
  if (insertError) throw insertError

  await seedMonthFromTemplates(userId, created.id)
  return created
}

export function useMonthlyPeriod(year: number, month: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: periodKey(year, month),
    enabled: !!user,
    queryFn: () => ensureMonthlyPeriod(user!.id, year, month),
  })
}

export function useUpdateMonthlyPeriod(year: number, month: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: { actual_saved_amount?: number | null; notes?: string | null }) => {
      const { error } = await supabase
        .from('monthly_periods')
        .update(updates)
        .eq('year', year)
        .eq('month', month)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: periodKey(year, month) }),
  })
}
