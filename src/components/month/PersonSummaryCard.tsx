import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatEUR, type PersonBreakdown } from '@/lib/calculations'
import type { HouseholdMember } from '@/lib/types'

export function PersonSummaryCard({
  breakdown,
  members,
  title = 'Per person',
}: {
  breakdown: { perPerson: PersonBreakdown[]; totalSharedCosts: number }
  members: HouseholdMember[]
  title?: string
}) {
  if (breakdown.perPerson.length === 0) return null

  function memberName(id: string | null) {
    return members.find((member) => member.id === id)?.name ?? 'Unassigned'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {breakdown.perPerson.map((person) => (
          <div key={person.memberId ?? 'unassigned'} className="flex flex-col gap-1">
            <span className="font-medium">{memberName(person.memberId)}</span>
            <Row label="Income" value={formatEUR(person.income)} />
            <Row label="Private costs" value={`− ${formatEUR(person.privateCosts)}`} />
            <Row label="Transfer to shared" value={`− ${formatEUR(person.sharedContribution)}`} />
            <div className="flex items-center justify-between font-medium">
              <span>Can save</span>
              <span style={{ color: person.savings >= 0 ? 'var(--savings)' : 'var(--destructive)' }}>
                {formatEUR(person.savings)}
              </span>
            </div>
            <Separator className="mt-2" />
          </div>
        ))}
        <Row label="Total shared costs" value={formatEUR(breakdown.totalSharedCosts)} />
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
