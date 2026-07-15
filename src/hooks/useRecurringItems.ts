import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import type { Frequency } from '@/lib/calculations'
import type { RecurringItem, RecurringItemType } from '@/lib/types'

const RECURRING_ITEMS_KEY = ['recurring_items'] as const

export function useRecurringItems() {
  const { user } = useAuth()

  return useQuery({
    queryKey: RECURRING_ITEMS_KEY,
    enabled: !!user,
    queryFn: async (): Promise<RecurringItem[]> => {
      const { data, error } = await supabase
        .from('recurring_items')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export interface RecurringItemInput {
  type: RecurringItemType
  name: string
  category: string | null
  default_amount: number
  frequency: Frequency
}

export function useCreateRecurringItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RecurringItemInput) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('recurring_items').insert({
        ...input,
        user_id: user.id,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_ITEMS_KEY }),
  })
}

export function useUpdateRecurringItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringItemInput> & { id: string; is_active?: boolean }) => {
      const { error } = await supabase.from('recurring_items').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_ITEMS_KEY }),
  })
}

export function useDeleteRecurringItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recurring_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_ITEMS_KEY }),
  })
}
