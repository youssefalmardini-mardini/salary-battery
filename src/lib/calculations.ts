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

export function round2(value: number): number {
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

export interface PersonBreakdown {
  memberId: string | null // null = "Unassigned" bucket (only occurs for orphaned rows)
  income: number
  privateCosts: number
  sharedContribution: number
  savings: number
}

export function calculatePersonBreakdown(input: {
  members: Array<{ id: string }>
  incomeEntries: Array<{ member_id: string | null; monthly_equivalent_amount: number }>
  expenseEntries: Array<{ member_id: string | null; monthly_equivalent_amount: number }>
  expectedSpending: Array<{ member_id: string | null; amount: number }>
}): { perPerson: PersonBreakdown[]; totalSharedCosts: number } {
  const memberIds = new Set(input.members.map((member) => member.id))
  // Anyone referenced by an entry but not in the members list (e.g. a deleted member) still
  // needs a bucket so their historical entries remain visible instead of silently vanishing.
  for (const entry of [...input.incomeEntries, ...input.expenseEntries, ...input.expectedSpending]) {
    if (entry.member_id !== null) memberIds.add(entry.member_id)
  }

  const totalSharedCosts = round2(
    input.expenseEntries
      .filter((entry) => entry.member_id === null)
      .reduce((sum, entry) => sum + entry.monthly_equivalent_amount, 0) +
      input.expectedSpending
        .filter((entry) => entry.member_id === null)
        .reduce((sum, entry) => sum + entry.amount, 0),
  )

  const totalHouseholdIncome = round2(
    input.incomeEntries.reduce((sum, entry) => sum + entry.monthly_equivalent_amount, 0),
  )

  const perPerson: PersonBreakdown[] = Array.from(memberIds).map((memberId) => {
    const income = round2(
      input.incomeEntries
        .filter((entry) => entry.member_id === memberId)
        .reduce((sum, entry) => sum + entry.monthly_equivalent_amount, 0),
    )
    const privateCosts = round2(
      input.expenseEntries
        .filter((entry) => entry.member_id === memberId)
        .reduce((sum, entry) => sum + entry.monthly_equivalent_amount, 0) +
        input.expectedSpending
          .filter((entry) => entry.member_id === memberId)
          .reduce((sum, entry) => sum + entry.amount, 0),
    )
    const incomeShare = totalHouseholdIncome > 0 ? income / totalHouseholdIncome : 1 / memberIds.size
    const sharedContribution = round2(totalSharedCosts * incomeShare)
    const savings = round2(income - privateCosts - sharedContribution)

    return { memberId, income, privateCosts, sharedContribution, savings }
  })

  return { perPerson, totalSharedCosts }
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
