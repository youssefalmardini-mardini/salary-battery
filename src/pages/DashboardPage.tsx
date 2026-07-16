import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BatteryBadge } from '@/components/BatteryBadge'
import { useYearOverview } from '@/hooks/useYearOverview'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import { useCurrencyFormatter } from '@/hooks/useCurrency'
import { MONTH_NAMES } from '@/lib/calculations'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const navigate = useNavigate()
  const { data: overview, isLoading, isError, refetch, isRefetching } = useYearOverview(year)
  const { data: members } = useHouseholdMembers()
  const format = useCurrencyFormatter()

  function memberName(id: string | null) {
    return members?.find((member) => member.id === id)?.name ?? 'Unassigned'
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setYear((y) => y - 1)} aria-label="Previous year">
            ←
          </Button>
          <h1 className="w-16 text-center font-heading text-xl font-medium">{year}</h1>
          <Button variant="outline" size="icon" onClick={() => setYear((y) => y + 1)} aria-label="Next year">
            →
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          {isRefetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Could not load your data. Try refreshing.</p>}

      {overview && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {overview.map(({ month, totals, personBreakdown }) => (
            <button
              key={month}
              onClick={() => navigate(`/month/${year}/${month}`)}
              className="cursor-pointer text-left"
            >
              <Card
                className={cn(
                  'h-full transition-colors hover:ring-2 hover:ring-ring/40',
                )}
              >
                <CardContent className="flex min-h-28 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{MONTH_NAMES[month - 1]}</span>
                    <BatteryBadge
                      percent={totals && totals.totalIncome > 0 ? (totals.calculatedSavings / totals.totalIncome) * 100 : 0}
                      className="shrink-0"
                    />
                  </div>
                  {totals ? (
                    <span
                      className={cn('text-lg font-semibold', totals.calculatedSavings < 0 && 'text-destructive')}
                      style={totals.calculatedSavings >= 0 ? { color: 'var(--savings)' } : undefined}
                    >
                      {format(totals.calculatedSavings)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No data yet</span>
                  )}

                  {personBreakdown && personBreakdown.perPerson.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5 border-t pt-1">
                      {personBreakdown.perPerson.map((person) => (
                        <div
                          key={person.memberId ?? 'unassigned'}
                          className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
                        >
                          <span className="truncate">{memberName(person.memberId)}</span>
                          <span className="shrink-0 whitespace-nowrap">
                            <span style={{ color: person.savings >= 0 ? 'var(--savings)' : 'var(--destructive)' }}>
                              {format(person.savings)}
                            </span>
                            {' · '}
                            {format(person.privateCosts + person.sharedContribution)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  )
}
