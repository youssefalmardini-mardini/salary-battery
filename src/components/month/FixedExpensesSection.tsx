import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryInput } from '@/components/CategoryInput'
import { FrequencySelect } from '@/components/FrequencySelect'
import { useAddExpenseEntry, useDeleteExpenseEntry, useExpenseEntries } from '@/hooks/useMonthEntries'
import { formatEUR, type Frequency } from '@/lib/calculations'

export function FixedExpensesSection({ periodId }: { periodId: string }) {
  const { data: entries } = useExpenseEntries(periodId)
  const addEntry = useAddExpenseEntry(periodId)
  const deleteEntry = useDeleteExpenseEntry(periodId)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')

  async function handleAdd() {
    const parsedAmount = Number(amount)
    if (!name.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) return
    await addEntry.mutateAsync({
      name: name.trim(),
      category: category.trim() || null,
      amount: parsedAmount,
      frequency,
    })
    setName('')
    setCategory('')
    setAmount('')
    setFrequency('monthly')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed payments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(entries ?? []).map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{entry.name}</span>
              <span className="text-muted-foreground">
                {formatEUR(entry.amount)} · {entry.frequency}
                {entry.category ? ` · ${entry.category}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{formatEUR(entry.monthly_equivalent_amount)}/mo</span>
              <Button variant="ghost" size="icon-sm" onClick={() => deleteEntry.mutate(entry.id)} aria-label="Remove">
                ×
              </Button>
            </div>
          </div>
        ))}

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
          <Input placeholder="Name (e.g. Rent)" value={name} onChange={(e) => setName(e.target.value)} />
          <CategoryInput value={category} onChange={setCategory} placeholder="Category (optional)" />
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Amount"
            className="sm:w-28"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="sm:w-36">
            <FrequencySelect value={frequency} onChange={setFrequency} />
          </div>
          <Button onClick={handleAdd} disabled={addEntry.isPending}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
