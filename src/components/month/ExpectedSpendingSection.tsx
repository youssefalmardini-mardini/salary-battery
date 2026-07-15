import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryInput } from '@/components/CategoryInput'
import { useAddExpectedSpending, useDeleteExpectedSpending, useExpectedSpending } from '@/hooks/useMonthEntries'
import { formatEUR } from '@/lib/calculations'

export function ExpectedSpendingSection({ periodId }: { periodId: string }) {
  const { data: entries } = useExpectedSpending(periodId)
  const addEntry = useAddExpectedSpending(periodId)
  const deleteEntry = useDeleteExpectedSpending(periodId)

  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')

  async function handleAdd() {
    const parsedAmount = Number(amount)
    if (!category.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) return
    await addEntry.mutateAsync({ category: category.trim(), amount: parsedAmount })
    setCategory('')
    setAmount('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected spending</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(entries ?? []).map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium">{entry.category}</span>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{formatEUR(entry.amount)}</span>
              <Button variant="ghost" size="icon-sm" onClick={() => deleteEntry.mutate(entry.id)} aria-label="Remove">
                ×
              </Button>
            </div>
          </div>
        ))}

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
          <CategoryInput value={category} onChange={setCategory} placeholder="Category (e.g. Groceries)" />
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Amount"
            className="sm:w-28"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={handleAdd} disabled={addEntry.isPending}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
