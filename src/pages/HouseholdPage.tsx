import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useCreateHouseholdMember,
  useDeleteHouseholdMember,
  useHouseholdMembers,
} from '@/hooks/useHouseholdMembers'

export function HouseholdPage() {
  const { data: members } = useHouseholdMembers()
  const createMember = useCreateHouseholdMember()
  const deleteMember = useDeleteHouseholdMember()
  const [name, setName] = useState('')

  async function handleAdd() {
    if (!name.trim()) return
    await createMember.mutateAsync(name.trim())
    setName('')
  }

  return (
    <AppShell>
      <h1 className="mb-6 font-heading text-xl font-medium">Household</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Add each person sharing this household's finances. Their income and private costs get
        tracked separately, and shared costs get split between them by income.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(members ?? []).map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium">{member.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteMember.mutate(member.id)}
                aria-label="Remove"
              >
                ×
              </Button>
            </div>
          ))}
          {(members ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No one added yet.</p>
          )}

          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Name (e.g. Me, Wife)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={handleAdd} disabled={createMember.isPending}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
