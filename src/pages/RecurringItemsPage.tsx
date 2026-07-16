import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EntryCard } from '@/components/month/EntryCard'
import { EntryDialog } from '@/components/EntryDialog'
import type { EntryEditorValues } from '@/components/EntryEditor'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'
import {
  useCreateRecurringItem,
  useDeleteRecurringItem,
  useRecurringItems,
  useUpdateRecurringItem,
} from '@/hooks/useRecurringItems'
import { useCurrencyFormatter } from '@/hooks/useCurrency'
import type { RecurringItem, RecurringItemType } from '@/lib/types'

export function RecurringItemsPage() {
  return (
    <AppShell>
      <h1 className="mb-6 font-heading text-xl font-medium">Recurring items</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        These are reusable templates — use "Add recurring items" on a month's page to pull them in. Editing them
        here doesn't change months already created.
      </p>
      <Tabs defaultValue="income">
        <TabsList>
          <TabsTrigger value="income">Income sources</TabsTrigger>
          <TabsTrigger value="fixed_expense">Fixed payments</TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <RecurringItemsList type="income" />
        </TabsContent>
        <TabsContent value="fixed_expense">
          <RecurringItemsList type="fixed_expense" />
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

type DialogState = { mode: 'add' } | { mode: 'edit'; item: RecurringItem } | null

function RecurringItemsList({ type }: { type: RecurringItemType }) {
  const { data: items } = useRecurringItems()
  const { data: members } = useHouseholdMembers()
  const format = useCurrencyFormatter()
  const createItem = useCreateRecurringItem()
  const updateItem = useUpdateRecurringItem()
  const deleteItem = useDeleteRecurringItem()

  const filtered = (items ?? []).filter((item) => item.type === type)
  const noMembersYet = type === 'income' && (members ?? []).length === 0

  const [dialogState, setDialogState] = useState<DialogState>(null)

  function memberLabel(id: string | null) {
    if (id === null) return type === 'income' ? 'Unassigned' : 'Shared'
    return members?.find((member) => member.id === id)?.name ?? 'Unassigned'
  }

  async function handleSave(values: EntryEditorValues) {
    if (type === 'income' && !values.memberId) return
    if (dialogState?.mode === 'edit') {
      await updateItem.mutateAsync({
        id: dialogState.item.id,
        name: values.name,
        category: values.category || null,
        default_amount: Number(values.amount),
        frequency: values.frequency,
        member_id: values.memberId,
      })
    } else {
      await createItem.mutateAsync({
        type,
        name: values.name,
        category: values.category || null,
        default_amount: Number(values.amount),
        frequency: values.frequency,
        member_id: values.memberId,
      })
    }
    setDialogState(null)
  }

  function renderItem(item: RecurringItem) {
    return (
      <EntryCard
        key={item.id}
        title={item.is_active ? item.name : `${item.name} (inactive)`}
        subtitle={`${memberLabel(item.member_id)} · ${format(item.default_amount)} · ${item.frequency}${item.category ? ` · ${item.category}` : ''}`}
        extra={
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateItem.mutate({ id: item.id, is_active: !item.is_active })}
          >
            {item.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        }
        onEdit={() => setDialogState({ mode: 'edit', item })}
        onDelete={() => deleteItem.mutate(item.id)}
      />
    )
  }

  const initialValues: EntryEditorValues =
    dialogState?.mode === 'edit'
      ? {
          name: dialogState.item.name,
          category: dialogState.item.category ?? '',
          amount: String(dialogState.item.default_amount),
          frequency: dialogState.item.frequency,
          memberId: dialogState.item.member_id,
          color: null,
        }
      : { name: '', category: '', amount: '', frequency: 'monthly', memberId: null, color: null }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{type === 'income' ? 'Income sources' : 'Fixed payments'}</CardTitle>
        {!noMembersYet && (
          <CardAction>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setDialogState({ mode: 'add' })}
              aria-label="Add recurring item"
            >
              <PlusIcon />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => renderItem(item))}
          </div>
        )}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}

        {noMembersYet && (
          <p className="mt-2 text-sm text-muted-foreground">
            <Link to="/household" className="font-medium text-foreground underline underline-offset-4">
              Add a household member
            </Link>{' '}
            first to set up an income source.
          </p>
        )}
      </CardContent>

      <EntryDialog
        open={dialogState !== null}
        onOpenChange={(open) => !open && setDialogState(null)}
        title={dialogState?.mode === 'edit' ? 'Edit recurring item' : 'Add recurring item'}
        initial={initialValues}
        showName
        showCategory
        showFrequency
        allowShared={type === 'fixed_expense'}
        requireMember={type === 'income'}
        isSaving={dialogState?.mode === 'edit' ? updateItem.isPending : createItem.isPending}
        onSave={handleSave}
      />
    </Card>
  )
}
