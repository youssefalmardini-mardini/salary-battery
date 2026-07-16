import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/button'
import { IncomeSection } from '@/components/month/IncomeSection'
import { FixedExpensesSection } from '@/components/month/FixedExpensesSection'
import { ExpectedSpendingSection } from '@/components/month/ExpectedSpendingSection'
import { SummaryCard } from '@/components/month/SummaryCard'
import { PersonSummaryCard } from '@/components/month/PersonSummaryCard'
import { BatteryBadge } from '@/components/BatteryBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useMonthlyPeriod, useUpdateMonthlyPeriod } from '@/hooks/useMonthlyPeriod'
import {
  useClearMonthEntries,
  useExpectedSpending,
  useExpenseEntries,
  useIncomeEntries,
} from '@/hooks/useMonthEntries'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import { useCopyPreviousMonth } from '@/hooks/useCopyPreviousMonth'
import { useAddRecurringItems } from '@/hooks/useAddRecurringItems'
import { calculateMonthlyTotals, calculatePersonBreakdown, MONTH_NAMES } from '@/lib/calculations'

export function MonthDetailPage() {
  const { year: yearParam, month: monthParam } = useParams()
  const navigate = useNavigate()
  const year = Number(yearParam)
  const month = Number(monthParam)

  const { data: period, isLoading, isError } = useMonthlyPeriod(year, month)
  const { data: incomeEntries } = useIncomeEntries(period?.id)
  const { data: expenseEntries } = useExpenseEntries(period?.id)
  const { data: expectedSpending } = useExpectedSpending(period?.id)
  const { data: members } = useHouseholdMembers()
  const updatePeriod = useUpdateMonthlyPeriod(year, month)
  const copyPreviousMonth = useCopyPreviousMonth(period?.id ?? '', year, month)
  const addRecurringItems = useAddRecurringItems(period?.id ?? '')
  const clearMonthEntries = useClearMonthEntries(period?.id ?? '')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  async function handleCopyPreviousMonth() {
    setStatusMessage(null)
    const copied = await copyPreviousMonth.mutateAsync()
    setStatusMessage(
      copied === 0 ? 'Nothing new to copy from last month.' : `Copied ${copied} item${copied === 1 ? '' : 's'} from last month.`,
    )
  }

  async function handleAddRecurringItems() {
    setStatusMessage(null)
    const added = await addRecurringItems.mutateAsync()
    setStatusMessage(
      added === 0 ? 'Nothing new to add — all recurring items are already here.' : `Added ${added} recurring item${added === 1 ? '' : 's'}.`,
    )
  }

  async function handleClearAll() {
    await clearMonthEntries.mutateAsync()
    setClearConfirmOpen(false)
    setStatusMessage('Cleared all entries for this month.')
  }

  const isValidDate = Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12

  const totals = period
    ? calculateMonthlyTotals({
        incomeEntries: incomeEntries ?? [],
        expenseEntries: expenseEntries ?? [],
        expectedSpending: expectedSpending ?? [],
      })
    : null

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
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-medium">
              {MONTH_NAMES[month - 1]} {year}
            </h1>
            {totals && (
              <BatteryBadge
                percent={totals.totalIncome > 0 ? (totals.calculatedSavings / totals.totalIncome) * 100 : 0}
                size="lg"
              />
            )}
          </div>
        </div>
        {period && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddRecurringItems}
                disabled={addRecurringItems.isPending}
              >
                {addRecurringItems.isPending ? 'Adding…' : 'Add recurring items'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPreviousMonth}
                disabled={copyPreviousMonth.isPending}
              >
                {copyPreviousMonth.isPending ? 'Copying…' : 'Copy from previous month'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setClearConfirmOpen(true)}
                disabled={clearMonthEntries.isPending}
              >
                Clear all
              </Button>
            </div>
            {statusMessage && <span className="text-xs text-muted-foreground">{statusMessage}</span>}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title={`Clear all entries for ${MONTH_NAMES[month - 1]} ${year}?`}
        description="This removes every income, fixed payment, and expected spending entry for this month. This can't be undone."
        confirmLabel="Clear all"
        isConfirming={clearMonthEntries.isPending}
        onConfirm={handleClearAll}
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Could not load this month. Try refreshing.</p>}

      {period && (
        <div className="flex flex-col gap-4">
          <IncomeSection periodId={period.id} />
          <FixedExpensesSection periodId={period.id} />
          <ExpectedSpendingSection periodId={period.id} />
          <SummaryCard
            period={period}
            totals={totals!}
            isSaving={updatePeriod.isPending}
            onSaveActual={(amount) => updatePeriod.mutate({ actual_saved_amount: amount })}
          />
          <PersonSummaryCard
            members={members ?? []}
            breakdown={calculatePersonBreakdown({
              members: members ?? [],
              incomeEntries: incomeEntries ?? [],
              expenseEntries: expenseEntries ?? [],
              expectedSpending: expectedSpending ?? [],
            })}
          />
        </div>
      )}
    </AppShell>
  )
}
