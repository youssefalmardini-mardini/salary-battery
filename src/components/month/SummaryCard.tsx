import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useCurrencyFormatter } from '@/hooks/useCurrency'
import type { MonthlyTotals } from '@/lib/calculations'
import type { MonthlyPeriod } from '@/lib/types'

export function SummaryCard({
  totals,
  period,
  onSaveActual,
  isSaving,
}: {
  totals: MonthlyTotals
  period: MonthlyPeriod
  onSaveActual: (amount: number | null) => void
  isSaving: boolean
}) {
  const format = useCurrencyFormatter()
  const [actualSaved, setActualSaved] = useState(period.actual_saved_amount?.toString() ?? '')

  function handleSave() {
    const trimmed = actualSaved.trim()
    if (trimmed === '') {
      onSaveActual(null)
      return
    }
    const parsed = Number(trimmed)
    if (Number.isFinite(parsed)) onSaveActual(parsed)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <Row label="Total income" value={format(totals.totalIncome)} />
        <Row label="Fixed payments" value={`− ${format(totals.totalFixed)}`} />
        <Row label="Expected spending" value={`− ${format(totals.totalExpectedSpending)}`} />
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <span className="font-medium">You can save this month</span>
          <span
            className="text-2xl font-semibold"
            style={{ color: totals.calculatedSavings >= 0 ? 'var(--savings)' : 'var(--destructive)' }}
          >
            {format(totals.calculatedSavings)}
          </span>
        </div>

        <Separator className="my-2" />
        <div className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="actual-saved">Actually saved (optional, fill in after the month)</Label>
            <Input
              id="actual-saved"
              type="number"
              inputMode="decimal"
              value={actualSaved}
              onChange={(e) => setActualSaved(e.target.value)}
              placeholder="e.g. 350"
            />
          </div>
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            Save
          </Button>
        </div>
        {period.actual_saved_amount !== null && (
          <p className="text-muted-foreground">
            Planned vs. actual: {format(totals.calculatedSavings - period.actual_saved_amount)} difference
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
