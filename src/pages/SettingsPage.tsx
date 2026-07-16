import { AppShell } from '@/components/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrency } from '@/hooks/useCurrency'
import { CURRENCIES } from '@/lib/currencies'

export function SettingsPage() {
  const { currency, setCurrency, isSaving } = useCurrency()

  function labelFor(code: string) {
    const match = CURRENCIES.find((option) => option.code === code)
    return match ? `${match.label} (${match.code})` : code
  }

  return (
    <AppShell>
      <h1 className="mb-6 font-heading text-xl font-medium">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label>Display currency</Label>
          <div className="max-w-xs">
            <Select value={currency} onValueChange={(next) => next && setCurrency(next)} disabled={isSaving}>
              <SelectTrigger className="w-full">
                <SelectValue>{labelFor}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.label} ({option.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Changes how amounts are displayed across the app. This doesn't convert existing amounts — it just
            changes the currency symbol and formatting.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  )
}
