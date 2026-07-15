import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { toMonthlyEquivalent, type Frequency } from '@/lib/calculations'
import type { MonthlyExpectedSpending, MonthlyExpenseEntry, MonthlyIncomeEntry } from '@/lib/types'

function incomeKey(periodId: string) {
  return ['monthly_income_entries', periodId] as const
}
function expenseKey(periodId: string) {
  return ['monthly_expense_entries', periodId] as const
}
function spendingKey(periodId: string) {
  return ['monthly_expected_spending', periodId] as const
}

export function useIncomeEntries(periodId: string | undefined) {
  return useQuery({
    queryKey: incomeKey(periodId ?? ''),
    enabled: !!periodId,
    queryFn: async (): Promise<MonthlyIncomeEntry[]> => {
      const { data, error } = await supabase
        .from('monthly_income_entries')
        .select('*')
        .eq('monthly_period_id', periodId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useExpenseEntries(periodId: string | undefined) {
  return useQuery({
    queryKey: expenseKey(periodId ?? ''),
    enabled: !!periodId,
    queryFn: async (): Promise<MonthlyExpenseEntry[]> => {
      const { data, error } = await supabase
        .from('monthly_expense_entries')
        .select('*')
        .eq('monthly_period_id', periodId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useExpectedSpending(periodId: string | undefined) {
  return useQuery({
    queryKey: spendingKey(periodId ?? ''),
    enabled: !!periodId,
    queryFn: async (): Promise<MonthlyExpectedSpending[]> => {
      const { data, error } = await supabase
        .from('monthly_expected_spending')
        .select('*')
        .eq('monthly_period_id', periodId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

/** Distinct categories already used across the user's data, for autocomplete suggestions only — never a fixed list. */
export function useKnownCategories() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['known_categories'],
    enabled: !!user,
    queryFn: async (): Promise<string[]> => {
      const [expenseRes, spendingRes] = await Promise.all([
        supabase.from('monthly_expense_entries').select('category'),
        supabase.from('monthly_expected_spending').select('category'),
      ])
      if (expenseRes.error) throw expenseRes.error
      if (spendingRes.error) throw spendingRes.error
      const categories = new Set<string>()
      for (const row of expenseRes.data) if (row.category) categories.add(row.category)
      for (const row of spendingRes.data) if (row.category) categories.add(row.category)
      return Array.from(categories).sort()
    },
  })
}

export function useAddIncomeEntry(periodId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; amount: number; frequency: Frequency; is_extra: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('monthly_income_entries').insert({
        monthly_period_id: periodId,
        user_id: user.id,
        recurring_item_id: null,
        name: input.name,
        amount: input.amount,
        frequency: input.frequency,
        monthly_equivalent_amount: toMonthlyEquivalent(input.amount, input.frequency),
        is_extra: input.is_extra,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: incomeKey(periodId) }),
  })
}

export function useDeleteIncomeEntry(periodId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('monthly_income_entries').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: incomeKey(periodId) }),
  })
}

export function useAddExpenseEntry(periodId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; category: string | null; amount: number; frequency: Frequency }) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('monthly_expense_entries').insert({
        monthly_period_id: periodId,
        user_id: user.id,
        recurring_item_id: null,
        name: input.name,
        category: input.category,
        amount: input.amount,
        frequency: input.frequency,
        monthly_equivalent_amount: toMonthlyEquivalent(input.amount, input.frequency),
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKey(periodId) }),
  })
}

export function useDeleteExpenseEntry(periodId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('monthly_expense_entries').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKey(periodId) }),
  })
}

export function useAddExpectedSpending(periodId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { category: string; amount: number }) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('monthly_expected_spending').insert({
        monthly_period_id: periodId,
        user_id: user.id,
        category: input.category,
        amount: input.amount,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: spendingKey(periodId) }),
  })
}

export function useDeleteExpectedSpending(periodId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('monthly_expected_spending').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: spendingKey(periodId) }),
  })
}
