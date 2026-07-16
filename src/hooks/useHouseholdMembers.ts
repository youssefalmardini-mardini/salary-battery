import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import type { HouseholdMember } from '@/lib/types'

const HOUSEHOLD_MEMBERS_KEY = ['household_members'] as const

export function useHouseholdMembers() {
  const { user } = useAuth()

  return useQuery({
    queryKey: HOUSEHOLD_MEMBERS_KEY,
    enabled: !!user,
    queryFn: async (): Promise<HouseholdMember[]> => {
      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreateHouseholdMember() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('household_members').insert({ name, user_id: user.id })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HOUSEHOLD_MEMBERS_KEY }),
  })
}

export function useUpdateHouseholdMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from('household_members').update({ name }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HOUSEHOLD_MEMBERS_KEY }),
  })
}

export function useDeleteHouseholdMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('household_members').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HOUSEHOLD_MEMBERS_KEY }),
  })
}
