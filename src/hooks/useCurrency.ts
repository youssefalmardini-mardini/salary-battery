import { useCallback, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/lib/calculations'
import { DEFAULT_CURRENCY_CODE } from '@/lib/currencies'

export function useCurrency() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const currency = (user?.user_metadata?.currency as string | undefined) ?? DEFAULT_CURRENCY_CODE

  async function setCurrency(code: string) {
    setIsSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { currency: code } })
    setIsSaving(false)
    if (error) throw error
  }

  return { currency, setCurrency, isSaving }
}

export function useCurrencyFormatter() {
  const { currency } = useCurrency()
  return useCallback((value: number) => formatCurrency(value, currency), [currency])
}
