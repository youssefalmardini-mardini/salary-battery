import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { toMonthlyEquivalent } from '@/lib/calculations'
import type { RecurringItem } from '@/lib/types'

async function fetchActiveRecurringItems(): Promise<RecurringItem[]> {
  const { data, error } = await supabase
    .from('recurring_items')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

/** Manually adds active recurring-item templates into a month, skipping any template already present there. */
export function useAddRecurringItems(periodId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<number> => {
      if (!user) throw new Error('Not authenticated')

      const [templates, existingIncome, existingExpenses] = await Promise.all([
        fetchActiveRecurringItems(),
        supabase.from('monthly_income_entries').select('recurring_item_id').eq('monthly_period_id', periodId),
        supabase.from('monthly_expense_entries').select('recurring_item_id').eq('monthly_period_id', periodId),
      ])
      if (existingIncome.error) throw existingIncome.error
      if (existingExpenses.error) throw existingExpenses.error

      const existingIncomeIds = new Set(existingIncome.data.map((e) => e.recurring_item_id))
      const existingExpenseIds = new Set(existingExpenses.data.map((e) => e.recurring_item_id))

      const incomeTemplates = templates.filter(
        (item) => item.type === 'income' && !existingIncomeIds.has(item.id),
      )
      const expenseTemplates = templates.filter(
        (item) => item.type === 'fixed_expense' && !existingExpenseIds.has(item.id),
      )

      let added = 0

      if (incomeTemplates.length > 0) {
        const seenPerMember = new Set<string | null>()
        const rows = incomeTemplates.map((item) => {
          const isExtra = seenPerMember.has(item.member_id)
          seenPerMember.add(item.member_id)
          return {
            monthly_period_id: periodId,
            user_id: user.id,
            recurring_item_id: item.id,
            member_id: item.member_id,
            name: item.name,
            amount: item.default_amount,
            frequency: item.frequency,
            monthly_equivalent_amount: toMonthlyEquivalent(item.default_amount, item.frequency),
            is_extra: isExtra,
          }
        })
        const { error } = await supabase.from('monthly_income_entries').insert(rows)
        if (error) throw error
        added += rows.length
      }

      if (expenseTemplates.length > 0) {
        const rows = expenseTemplates.map((item) => ({
          monthly_period_id: periodId,
          user_id: user.id,
          recurring_item_id: item.id,
          member_id: item.member_id,
          name: item.name,
          category: item.category,
          amount: item.default_amount,
          frequency: item.frequency,
          monthly_equivalent_amount: toMonthlyEquivalent(item.default_amount, item.frequency),
        }))
        const { error } = await supabase.from('monthly_expense_entries').insert(rows)
        if (error) throw error
        added += rows.length
      }

      return added
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly_income_entries', periodId] })
      queryClient.invalidateQueries({ queryKey: ['monthly_expense_entries', periodId] })
    },
  })
}
