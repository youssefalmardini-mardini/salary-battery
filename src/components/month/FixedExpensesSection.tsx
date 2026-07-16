import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EntryCard, EntryGroup } from '@/components/month/EntryCard'
import { EntryDialog } from '@/components/EntryDialog'
import type { EntryEditorValues } from '@/components/EntryEditor'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import {
  useAddExpenseEntry,
  useDeleteExpenseEntry,
  useExpenseEntries,
  useUpdateExpenseEntry,
} from '@/hooks/useMonthEntries'
import { useCurrencyFormatter } from '@/hooks/useCurrency'
import type { MonthlyExpenseEntry } from '@/lib/types'

type DialogState = { mode: 'add' } | { mode: 'edit'; entry: MonthlyExpenseEntry } | null

export function FixedExpensesSection({ periodId }: { periodId: string }) {
  const { data: entries } = useExpenseEntries(periodId)
  const { data: members } = useHouseholdMembers()
  const format = useCurrencyFormatter()
  const addEntry = useAddExpenseEntry(periodId)
  const updateEntry = useUpdateExpenseEntry(periodId)
  const deleteEntry = useDeleteExpenseEntry(periodId)

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

  function entrySubtitle(entry: MonthlyExpenseEntry) {
    return `${format(entry.amount)} · ${entry.frequency}${entry.category ? ` · ${entry.category}` : ''}`
  }

  async function handleSave(values: EntryEditorValues) {
    if (dialogState?.mode === 'edit') {
      await updateEntry.mutateAsync({
        id: dialogState.entry.id,
        name: values.name,
        category: values.category || null,
        amount: Number(values.amount),
        frequency: values.frequency,
        member_id: values.memberId,
        color: values.color,
      })
    } else {
      await addEntry.mutateAsync({
        name: values.name,
        category: values.category || null,
        amount: Number(values.amount),
        frequency: values.frequency,
        member_id: values.memberId,
        color: values.color,
      })
    }
    setDialogState(null)
  }

  function renderEntry(entry: MonthlyExpenseEntry) {
    return (
      <EntryCard
        key={entry.id}
        title={entry.name}
        subtitle={entrySubtitle(entry)}
        trailing={`${format(entry.monthly_equivalent_amount)}/mo`}
        accentColor={entry.color}
        onEdit={() => setDialogState({ mode: 'edit', entry })}
        onDelete={() => deleteEntry.mutate(entry.id)}
      />
    )
  }

  const initialValues: EntryEditorValues =
    dialogState?.mode === 'edit'
      ? {
          name: dialogState.entry.name,
          category: dialogState.entry.category ?? '',
          amount: String(dialogState.entry.amount),
          frequency: dialogState.entry.frequency,
          memberId: dialogState.entry.member_id,
          color: dialogState.entry.color,
        }
      : { name: '', category: '', amount: '', frequency: 'monthly', memberId: null, color: null }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed payments</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setDialogState({ mode: 'add' })}
            aria-label="Add fixed payment"
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
        title={dialogState?.mode === 'edit' ? 'Edit fixed payment' : 'Add fixed payment'}
        initial={initialValues}
        showName
        showCategory
        showFrequency
        showColor
        allowShared
        isSaving={dialogState?.mode === 'edit' ? updateEntry.isPending : addEntry.isPending}
        onSave={handleSave}
      />
    </Card>
  )
}
