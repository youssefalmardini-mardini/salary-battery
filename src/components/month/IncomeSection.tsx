import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from 'lucide-react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EntryCard, EntryGroup } from '@/components/month/EntryCard'
import { EntryDialog } from '@/components/EntryDialog'
import type { EntryEditorValues } from '@/components/EntryEditor'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import { useAddIncomeEntry, useDeleteIncomeEntry, useIncomeEntries, useUpdateIncomeEntry } from '@/hooks/useMonthEntries'
import { formatEUR } from '@/lib/calculations'
import type { MonthlyIncomeEntry } from '@/lib/types'

type DialogState = { mode: 'add' } | { mode: 'edit'; entry: MonthlyIncomeEntry } | null

export function IncomeSection({ periodId }: { periodId: string }) {
  const { data: entries } = useIncomeEntries(periodId)
  const { data: members } = useHouseholdMembers()
  const addEntry = useAddIncomeEntry(periodId)
  const updateEntry = useUpdateIncomeEntry(periodId)
  const deleteEntry = useDeleteIncomeEntry(periodId)

  const [dialogState, setDialogState] = useState<DialogState>(null)

  const personGroups = (members ?? [])
    .map((member) => ({
      member,
      entries: (entries ?? []).filter((entry) => entry.member_id === member.id),
    }))
    .filter((group) => group.entries.length > 0)

  const knownMemberIds = new Set((members ?? []).map((member) => member.id))
  const unassignedEntries = (entries ?? []).filter((entry) => !knownMemberIds.has(entry.member_id as string))

  function entrySubtitle(entry: MonthlyIncomeEntry) {
    return `${formatEUR(entry.amount)} · ${entry.frequency}${entry.is_extra ? ' · extra' : ''}`
  }

  async function handleSave(values: EntryEditorValues) {
    if (!values.memberId) return
    if (dialogState?.mode === 'edit') {
      await updateEntry.mutateAsync({
        id: dialogState.entry.id,
        name: values.name,
        amount: Number(values.amount),
        frequency: values.frequency,
        member_id: values.memberId,
      })
    } else {
      const hasExistingForMember = (entries ?? []).some((entry) => entry.member_id === values.memberId)
      await addEntry.mutateAsync({
        name: values.name,
        amount: Number(values.amount),
        frequency: values.frequency,
        member_id: values.memberId,
        is_extra: hasExistingForMember,
      })
    }
    setDialogState(null)
  }

  function renderEntry(entry: MonthlyIncomeEntry) {
    return (
      <EntryCard
        key={entry.id}
        title={entry.name}
        subtitle={entrySubtitle(entry)}
        trailing={`${formatEUR(entry.monthly_equivalent_amount)}/mo`}
        onEdit={() => setDialogState({ mode: 'edit', entry })}
        onDelete={() => deleteEntry.mutate(entry.id)}
      />
    )
  }

  const initialValues: EntryEditorValues =
    dialogState?.mode === 'edit'
      ? {
          name: dialogState.entry.name,
          category: '',
          amount: String(dialogState.entry.amount),
          frequency: dialogState.entry.frequency,
          memberId: dialogState.entry.member_id,
          color: null,
        }
      : { name: '', category: '', amount: '', frequency: 'monthly', memberId: null, color: null }

  const noMembersYet = (members ?? []).length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income</CardTitle>
        {!noMembersYet && (
          <CardAction>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setDialogState({ mode: 'add' })}
              aria-label="Add income"
            >
              <PlusIcon />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {personGroups.map(({ member, entries: memberEntries }) => (
          <EntryGroup key={member.id} title={member.name}>
            {memberEntries.map((entry) => renderEntry(entry))}
          </EntryGroup>
        ))}

        {unassignedEntries.length > 0 && (
          <EntryGroup title="Unassigned">{unassignedEntries.map((entry) => renderEntry(entry))}</EntryGroup>
        )}

        {noMembersYet ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/household" className="font-medium text-foreground underline underline-offset-4">
              Add a household member
            </Link>{' '}
            first to start entering income.
          </p>
        ) : (
          (entries ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>
        )}
      </CardContent>

      <EntryDialog
        open={dialogState !== null}
        onOpenChange={(open) => !open && setDialogState(null)}
        title={dialogState?.mode === 'edit' ? 'Edit income' : 'Add income'}
        initial={initialValues}
        showName
        showFrequency
        requireMember
        isSaving={dialogState?.mode === 'edit' ? updateEntry.isPending : addEntry.isPending}
        onSave={handleSave}
      />
    </Card>
  )
}
