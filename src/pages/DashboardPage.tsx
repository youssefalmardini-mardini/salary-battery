import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useYearOverview } from '@/hooks/useYearOverview'
import { formatEUR, MONTH_NAMES } from '@/lib/calculations'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const navigate = useNavigate()
  const { data: overview, isLoading, isError, refetch, isRefetching } = useYearOverview(year)

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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {overview.map(({ month, totals }) => (
            <button
              key={month}
              onClick={() => navigate(`/month/${year}/${month}`)}
              className="text-left"
            >
              <Card
                className={cn(
                  'h-full transition-colors hover:ring-2 hover:ring-ring/40',
                )}
              >
                <CardContent className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{MONTH_NAMES[month - 1]}</span>
                  {totals ? (
                    <span
                      className={cn('text-lg font-semibold', totals.calculatedSavings < 0 && 'text-destructive')}
                      style={totals.calculatedSavings >= 0 ? { color: 'var(--savings)' } : undefined}
                    >
                      {formatEUR(totals.calculatedSavings)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No data yet</span>
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
