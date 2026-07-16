import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EntryCard, EntryGroup } from '@/components/month/EntryCard'
import { EntryDialog } from '@/components/EntryDialog'
import type { EntryEditorValues } from '@/components/EntryEditor'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import {
  useAddExpectedSpending,
  useDeleteExpectedSpending,
  useExpectedSpending,
  useUpdateExpectedSpending,
} from '@/hooks/useMonthEntries'
import { useCurrencyFormatter } from '@/hooks/useCurrency'
import type { MonthlyExpectedSpending } from '@/lib/types'

type DialogState = { mode: 'add' } | { mode: 'edit'; entry: MonthlyExpectedSpending } | null

export function ExpectedSpendingSection({ periodId }: { periodId: string }) {
  const { data: entries } = useExpectedSpending(periodId)
  const { data: members } = useHouseholdMembers()
  const format = useCurrencyFormatter()
  const addEntry = useAddExpectedSpending(periodId)
  const updateEntry = useUpdateExpectedSpending(periodId)
  const deleteEntry = useDeleteExpectedSpending(periodId)

  const [dialogState, setDialogState] = useState<DialogState>(null)

  const sharedEntries = (entries ?? []).filter((entry) => entry.member_id === null)
  const personalEntries = (entries ?? []).filter((entry) => entry.member_id !== null)

  const personGroups = (members ?? [])
    .map((member) => ({
      member,
      entries: personalEntries.filter((entry) => entry.member_id === member.id),
    }))
    .filter((group) => group.entries.length > 0)

  const knownMemberIds = new Set((members ?? []).map((member) => member.id))
  const unassignedEntries = personalEntries.filter(
    (entry) => !knownMemberIds.has(entry.member_id as string),
  )

  async function handleSave(values: EntryEditorValues) {
    if (dialogState?.mode === 'edit') {
      await updateEntry.mutateAsync({
        id: dialogState.entry.id,
        category: values.category,
        amount: Number(values.amount),
        member_id: values.memberId,
        color: values.color,
      })
    } else {
      await addEntry.mutateAsync({
        category: values.category,
        amount: Number(values.amount),
        member_id: values.memberId,
        color: values.color,
      })
    }
    setDialogState(null)
  }

  function renderEntry(entry: MonthlyExpectedSpending) {
    return (
      <EntryCard
        key={entry.id}
        title={entry.category}
        trailing={format(entry.amount)}
        accentColor={entry.color}
        onEdit={() => setDialogState({ mode: 'edit', entry })}
        onDelete={() => deleteEntry.mutate(entry.id)}
      />
    )
  }

  const initialValues: EntryEditorValues =
    dialogState?.mode === 'edit'
      ? {
          name: '',
          category: dialogState.entry.category,
          amount: String(dialogState.entry.amount),
          frequency: 'monthly',
          memberId: dialogState.entry.member_id,
          color: dialogState.entry.color,
        }
      : { name: '', category: '', amount: '', frequency: 'monthly', memberId: null, color: null }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected spending</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setDialogState({ mode: 'add' })}
            aria-label="Add expected spending"
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sharedEntries.length > 0 && (
          <EntryGroup title="Shared">{sharedEntries.map((entry) => renderEntry(entry))}</EntryGroup>
        )}

        {personGroups.map(({ member, entries: memberEntries }) => (
          <EntryGroup key={member.id} title={member.name}>
            {memberEntries.map((entry) => renderEntry(entry))}
          </EntryGroup>
        ))}

        {unassignedEntries.length > 0 && (
          <EntryGroup title="Unassigned">{unassignedEntries.map((entry) => renderEntry(entry))}</EntryGroup>
        )}

        {(entries ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}
      </CardContent>

      <EntryDialog
        open={dialogState !== null}
        onOpenChange={(open) => !open && setDialogState(null)}
        title={dialogState?.mode === 'edit' ? 'Edit expected spending' : 'Add expected spending'}
        initial={initialValues}
        showCategory
        requireCategory
        showColor
        allowShared
        isSaving={dialogState?.mode === 'edit' ? updateEntry.isPending : addEntry.isPending}
        onSave={handleSave}
      />
    </Card>
  )
}
