import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Frequency } from '@/lib/calculations'

const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  yearly: 'Yearly',
}

export function FrequencySelect({
  value,
  onChange,
}: {
  value: Frequency
  onChange: (value: Frequency) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as Frequency)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((frequency) => (
          <SelectItem key={frequency} value={frequency}>
            {FREQUENCY_LABELS[frequency]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
