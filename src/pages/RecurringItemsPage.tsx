import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryInput } from '@/components/CategoryInput'
import { FrequencySelect } from '@/components/FrequencySelect'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  useCreateRecurringItem,
  useDeleteRecurringItem,
  useRecurringItems,
  useUpdateRecurringItem,
} from '@/hooks/useRecurringItems'
import { formatEUR, type Frequency } from '@/lib/calculations'
import type { RecurringItemType } from '@/lib/types'

export function RecurringItemsPage() {
  return (
    <AppShell>
      <h1 className="mb-6 font-heading text-xl font-medium">Recurring items</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        These templates automatically prefill new months. Editing them here doesn't change months already created.
      </p>
      <Tabs defaultValue="income">
        <TabsList>
          <TabsTrigger value="income">Income sources</TabsTrigger>
          <TabsTrigger value="fixed_expense">Fixed payments</TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <RecurringItemsList type="income" />
        </TabsContent>
        <TabsContent value="fixed_expense">
          <RecurringItemsList type="fixed_expense" />
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

function RecurringItemsList({ type }: { type: RecurringItemType }) {
  const { data: items } = useRecurringItems()
  const createItem = useCreateRecurringItem()
  const updateItem = useUpdateRecurringItem()
  const deleteItem = useDeleteRecurringItem()

  const filtered = (items ?? []).filter((item) => item.type === type)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')

  async function handleAdd() {
    const parsedAmount = Number(amount)
    if (!name.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) return
    await createItem.mutateAsync({
      type,
      name: name.trim(),
      category: category.trim() || null,
      default_amount: parsedAmount,
      frequency,
    })
    setName('')
    setCategory('')
    setAmount('')
    setFrequency('monthly')
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{type === 'income' ? 'Income sources' : 'Fixed payments'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex flex-col">
              <span className={item.is_active ? 'font-medium' : 'font-medium text-muted-foreground line-through'}>
                {item.name}
              </span>
              <span className="text-muted-foreground">
                {formatEUR(item.default_amount)} · {item.frequency}
                {item.category ? ` · ${item.category}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateItem.mutate({ id: item.id, is_active: !item.is_active })}
              >
                {item.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => deleteItem.mutate(item.id)} aria-label="Delete">
                ×
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
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
          <Button onClick={handleAdd} disabled={createItem.isPending}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
