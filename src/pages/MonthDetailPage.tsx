import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { IncomeSection } from '@/components/month/IncomeSection'
import { FixedExpensesSection } from '@/components/month/FixedExpensesSection'
import { ExpectedSpendingSection } from '@/components/month/ExpectedSpendingSection'
import { SummaryCard } from '@/components/month/SummaryCard'
import { useMonthlyPeriod, useUpdateMonthlyPeriod } from '@/hooks/useMonthlyPeriod'
import { useExpectedSpending, useExpenseEntries, useIncomeEntries } from '@/hooks/useMonthEntries'
import { calculateMonthlyTotals, MONTH_NAMES } from '@/lib/calculations'

export function MonthDetailPage() {
  const { year: yearParam, month: monthParam } = useParams()
  const navigate = useNavigate()
  const year = Number(yearParam)
  const month = Number(monthParam)

  const { data: period, isLoading, isError } = useMonthlyPeriod(year, month)
  const { data: incomeEntries } = useIncomeEntries(period?.id)
  const { data: expenseEntries } = useExpenseEntries(period?.id)
  const { data: expectedSpending } = useExpectedSpending(period?.id)
  const updatePeriod = useUpdateMonthlyPeriod(year, month)

  const isValidDate = Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12

  if (!isValidDate) {
    return (
      <AppShell>
        <p className="text-sm text-destructive">Invalid month.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Back to dashboard
        </Button>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
          <h1 className="font-heading text-xl font-medium">
            {MONTH_NAMES[month - 1]} {year}
          </h1>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Could not load this month. Try refreshing.</p>}

      {period && (
        <div className="flex flex-col gap-4">
          <IncomeSection periodId={period.id} />
          <FixedExpensesSection periodId={period.id} />
          <ExpectedSpendingSection periodId={period.id} />
          <SummaryCard
            period={period}
            totals={calculateMonthlyTotals({
              incomeEntries: incomeEntries ?? [],
              expenseEntries: expenseEntries ?? [],
              expectedSpending: expectedSpending ?? [],
            })}
            isSaving={updatePeriod.isPending}
            onSaveActual={(amount) => updatePeriod.mutate({ actual_saved_amount: amount })}
          />
        </div>
      )}
    </AppShell>
  )
}
