import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import type { MonthlyPeriod } from '@/lib/types'

function periodKey(year: number, month: number) {
  return ['monthly_period', year, month] as const
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
