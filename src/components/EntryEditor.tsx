import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CategoryInput } from '@/components/CategoryInput'
import { FrequencySelect } from '@/components/FrequencySelect'
import { PersonSelect } from '@/components/PersonSelect'
import { PASTEL_COLORS } from '@/lib/pastelColors'
import { cn } from '@/lib/utils'
import type { Frequency } from '@/lib/calculations'

export interface EntryEditorValues {
  name: string
  category: string
  amount: string
  frequency: Frequency
  memberId: string | null
  color: string | null
}

export function EntryEditor({
  initial,
  showName = false,
  showCategory = false,
  requireCategory = false,
  showFrequency = false,
  showColor = false,
  allowShared = false,
  requireMember = false,
  isSaving = false,
  onSave,
  onCancel,
}: {
  initial: EntryEditorValues
  showName?: boolean
  showCategory?: boolean
  requireCategory?: boolean
  showFrequency?: boolean
  showColor?: boolean
  allowShared?: boolean
  requireMember?: boolean
  isSaving?: boolean
  onSave: (values: EntryEditorValues) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial.name)
  const [category, setCategory] = useState(initial.category)
  const [amount, setAmount] = useState(initial.amount)
  const [frequency, setFrequency] = useState<Frequency>(initial.frequency)
  const [memberId, setMemberId] = useState<string | null>(initial.memberId)
  const [color, setColor] = useState<string | null>(initial.color)

  const parsedAmount = Number(amount)
  const canSave =
    Number.isFinite(parsedAmount) &&
    parsedAmount >= 0 &&
    (!showName || name.trim().length > 0) &&
    (!requireCategory || category.trim().length > 0) &&
    (!requireMember || memberId !== null)

  function handleSave() {
    if (!canSave) return
    onSave({ name: name.trim(), category: category.trim(), amount, frequency, memberId, color })
  }

  return (
    <div className="flex flex-col gap-4">
      {showName && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="entry-editor-name">Name</Label>
          <Input id="entry-editor-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
      )}
      {showCategory && (
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <CategoryInput value={category} onChange={setCategory} placeholder={requireCategory ? 'e.g. Groceries' : 'Optional'} />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="entry-editor-amount">Amount</Label>
        <Input
          id="entry-editor-amount"
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      {showFrequency && (
        <div className="flex flex-col gap-1.5">
          <Label>Frequency</Label>
          <FrequencySelect value={frequency} onChange={setFrequency} />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label>Who's this for?</Label>
        <PersonSelect value={memberId} onChange={setMemberId} allowShared={allowShared} />
      </div>
      {showColor && (
        <div className="flex flex-col gap-1.5">
          <Label>Color</Label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setColor(null)}
              aria-label="No color"
              className={cn(
                'flex size-7 items-center justify-center rounded-full ring-1 ring-foreground/15',
                color === null && 'ring-2 ring-foreground',
              )}
            >
              <span className="size-4 rounded-full bg-[repeating-conic-gradient(#e5e7eb_0_90deg,transparent_0_180deg)]" />
            </button>
            {PASTEL_COLORS.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                onClick={() => setColor(swatch.value)}
                aria-label={swatch.label}
                title={swatch.label}
                className={cn(
                  'size-7 rounded-full ring-1 ring-foreground/15',
                  color === swatch.value && 'ring-2 ring-foreground',
                )}
                style={{ backgroundColor: swatch.value }}
              />
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave || isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
