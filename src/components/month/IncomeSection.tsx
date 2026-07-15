import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FrequencySelect } from '@/components/FrequencySelect'
import { useAddIncomeEntry, useDeleteIncomeEntry, useIncomeEntries } from '@/hooks/useMonthEntries'
import { formatEUR, type Frequency } from '@/lib/calculations'

export function IncomeSection({ periodId }: { periodId: string }) {
  const { data: entries } = useIncomeEntries(periodId)
  const addEntry = useAddIncomeEntry(periodId)
  const deleteEntry = useDeleteIncomeEntry(periodId)

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')

  async function handleAdd() {
    const parsedAmount = Number(amount)
    if (!name.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) return
    await addEntry.mutateAsync({
      name: name.trim(),
      amount: parsedAmount,
      frequency,
      is_extra: (entries?.length ?? 0) > 0,
    })
    setName('')
    setAmount('')
    setFrequency('monthly')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(entries ?? []).map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{entry.name}</span>
              <span className="text-muted-foreground">
                {formatEUR(entry.amount)} · {entry.frequency}
                {entry.is_extra ? ' · extra' : ''}
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

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <Input placeholder="Source (e.g. Salary)" value={name} onChange={(e) => setName(e.target.value)} />
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
