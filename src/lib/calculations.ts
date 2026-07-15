export type Frequency = 'monthly' | 'weekly' | 'biweekly' | 'yearly'

const MONTHLY_MULTIPLIER: Record<Frequency, number> = {
  monthly: 1,
  weekly: 52 / 12,
  biweekly: 26 / 12,
  yearly: 1 / 12,
}

export function toMonthlyEquivalent(amount: number, frequency: Frequency): number {
  return round2(amount * MONTHLY_MULTIPLIER[frequency])
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export interface MonthlyTotals {
  totalIncome: number
  totalFixed: number
  totalExpectedSpending: number
  calculatedSavings: number
}

export function calculateMonthlyTotals(input: {
  incomeEntries: Array<{ monthly_equivalent_amount: number }>
  expenseEntries: Array<{ monthly_equivalent_amount: number }>
  expectedSpending: Array<{ amount: number }>
}): MonthlyTotals {
  const totalIncome = round2(
    input.incomeEntries.reduce((sum, entry) => sum + entry.monthly_equivalent_amount, 0),
  )
  const totalFixed = round2(
    input.expenseEntries.reduce((sum, entry) => sum + entry.monthly_equivalent_amount, 0),
  )
  const totalExpectedSpending = round2(
    input.expectedSpending.reduce((sum, entry) => sum + entry.amount, 0),
  )
  const calculatedSavings = round2(totalIncome - totalFixed - totalExpectedSpending)

  return { totalIncome, totalFixed, totalExpectedSpending, calculatedSavings }
}

const EUR_FORMATTER = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
})

export function formatEUR(value: number): string {
  return EUR_FORMATTER.format(value)
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
