import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

function previousMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

function dedupeKey(name: string, memberId: string | null) {
  return `${name}::${memberId ?? ''}`
}

export function useCopyPreviousMonth(periodId: string, year: number, month: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<number> => {
      if (!user) throw new Error('Not authenticated')
      const prev = previousMonth(year, month)

      const { data: prevPeriod, error: prevPeriodError } = await supabase
        .from('monthly_periods')
        .select('id')
        .eq('year', prev.year)
        .eq('month', prev.month)
        .maybeSingle()
      if (prevPeriodError) throw prevPeriodError
      if (!prevPeriod) return 0

      const [prevIncome, prevExpenses, prevSpending, currentIncome, currentExpenses, currentSpending] =
        await Promise.all([
          supabase.from('monthly_income_entries').select('*').eq('monthly_period_id', prevPeriod.id),
          supabase.from('monthly_expense_entries').select('*').eq('monthly_period_id', prevPeriod.id),
          supabase.from('monthly_expected_spending').select('*').eq('monthly_period_id', prevPeriod.id),
          supabase.from('monthly_income_entries').select('name, member_id').eq('monthly_period_id', periodId),
          supabase.from('monthly_expense_entries').select('name, member_id').eq('monthly_period_id', periodId),
          supabase
            .from('monthly_expected_spending')
            .select('category, member_id')
            .eq('monthly_period_id', periodId),
        ])
      if (prevIncome.error) throw prevIncome.error
      if (prevExpenses.error) throw prevExpenses.error
      if (prevSpending.error) throw prevSpending.error
      if (currentIncome.error) throw currentIncome.error
      if (currentExpenses.error) throw currentExpenses.error
      if (currentSpending.error) throw currentSpending.error

      const existingIncomeKeys = new Set(currentIncome.data.map((e) => dedupeKey(e.name, e.member_id)))
      const existingExpenseKeys = new Set(currentExpenses.data.map((e) => dedupeKey(e.name, e.member_id)))
      const existingSpendingKeys = new Set(
        currentSpending.data.map((e) => dedupeKey(e.category, e.member_id)),
      )

      const incomeRows = prevIncome.data
        .filter((e) => !existingIncomeKeys.has(dedupeKey(e.name, e.member_id)))
        .map((e) => ({
          monthly_period_id: periodId,
          user_id: user.id,
          recurring_item_id: e.recurring_item_id,
          member_id: e.member_id,
          name: e.name,
          amount: e.amount,
          frequency: e.frequency,
          monthly_equivalent_amount: e.monthly_equivalent_amount,
          is_extra: e.is_extra,
        }))

      const expenseRows = prevExpenses.data
        .filter((e) => !existingExpenseKeys.has(dedupeKey(e.name, e.member_id)))
        .map((e) => ({
          monthly_period_id: periodId,
          user_id: user.id,
          recurring_item_id: e.recurring_item_id,
          member_id: e.member_id,
          name: e.name,
          category: e.category,
          amount: e.amount,
          frequency: e.frequency,
          monthly_equivalent_amount: e.monthly_equivalent_amount,
          color: e.color,
        }))

      const spendingRows = prevSpending.data
        .filter((e) => !existingSpendingKeys.has(dedupeKey(e.category, e.member_id)))
        .map((e) => ({
          monthly_period_id: periodId,
          user_id: user.id,
          member_id: e.member_id,
          category: e.category,
          amount: e.amount,
          color: e.color,
        }))

      const inserts = await Promise.all([
        incomeRows.length > 0
          ? supabase.from('monthly_income_entries').insert(incomeRows)
          : Promise.resolve({ error: null }),
        expenseRows.length > 0
          ? supabase.from('monthly_expense_entries').insert(expenseRows)
          : Promise.resolve({ error: null }),
        spendingRows.length > 0
          ? supabase.from('monthly_expected_spending').insert(spendingRows)
          : Promise.resolve({ error: null }),
      ])
      for (const result of inserts) if (result.error) throw result.error

      return incomeRows.length + expenseRows.length + spendingRows.length
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly_income_entries', periodId] })
      queryClient.invalidateQueries({ queryKey: ['monthly_expense_entries', periodId] })
      queryClient.invalidateQueries({ queryKey: ['monthly_expected_spending', periodId] })
    },
  })
}
