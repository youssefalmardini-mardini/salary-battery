import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { calculateMonthlyTotals, type MonthlyTotals } from '@/lib/calculations'
import type { MonthlyPeriod } from '@/lib/types'

export interface MonthOverview {
  month: number
  period: MonthlyPeriod | null
  totals: MonthlyTotals | null
}

export function useYearOverview(year: number) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['year_overview', year],
    enabled: !!user,
    queryFn: async (): Promise<MonthOverview[]> => {
      const { data: periods, error: periodsError } = await supabase
        .from('monthly_periods')
        .select('*')
        .eq('year', year)
      if (periodsError) throw periodsError

      const periodIds = periods.map((period) => period.id)

      const [incomeRes, expenseRes, spendingRes] =
        periodIds.length > 0
          ? await Promise.all([
              supabase
                .from('monthly_income_entries')
                .select('monthly_period_id, monthly_equivalent_amount')
                .in('monthly_period_id', periodIds),
              supabase
                .from('monthly_expense_entries')
                .select('monthly_period_id, monthly_equivalent_amount')
                .in('monthly_period_id', periodIds),
              supabase
                .from('monthly_expected_spending')
                .select('monthly_period_id, amount')
                .in('monthly_period_id', periodIds),
            ])
          : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }]

      if (incomeRes.error) throw incomeRes.error
      if (expenseRes.error) throw expenseRes.error
      if (spendingRes.error) throw spendingRes.error

      const periodsByMonth = new Map<number, MonthlyPeriod>()
      for (const period of periods) periodsByMonth.set(period.month, period)

      const overview: MonthOverview[] = []
      for (let month = 1; month <= 12; month++) {
        const period = periodsByMonth.get(month) ?? null
        if (!period) {
          overview.push({ month, period: null, totals: null })
          continue
        }
        const incomeEntries = incomeRes.data.filter((row) => row.monthly_period_id === period.id)
        const expenseEntries = expenseRes.data.filter((row) => row.monthly_period_id === period.id)
        const expectedSpending = spendingRes.data.filter((row) => row.monthly_period_id === period.id)
        overview.push({
          month,
          period,
          totals: calculateMonthlyTotals({ incomeEntries, expenseEntries, expectedSpending }),
        })
      }
      return overview
    },
  })
}
