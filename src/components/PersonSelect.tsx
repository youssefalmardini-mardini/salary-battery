import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useHouseholdMembers } from '@/hooks/useHouseholdMembers'

const SHARED_VALUE = '__shared__'

export function PersonSelect({
  value,
  onChange,
  allowShared = false,
}: {
  value: string | null
  onChange: (value: string | null) => void
  allowShared?: boolean
}) {
  const { data: members } = useHouseholdMembers()

  function labelFor(current: string) {
    if (current === SHARED_VALUE) return 'Shared'
    return members?.find((member) => member.id === current)?.name ?? "Who's this for?"
  }

  return (
    <Select
      value={value ?? SHARED_VALUE}
      onValueChange={(next) => onChange(next === SHARED_VALUE ? null : next)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Who's this for?">{labelFor}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowShared && <SelectItem value={SHARED_VALUE}>Shared</SelectItem>}
        {(members ?? []).map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
