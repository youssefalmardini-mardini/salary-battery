import { Input } from '@/components/ui/input'
import { useKnownCategories } from '@/hooks/useMonthEntries'

/**
 * Free-text category field. Existing categories (sourced live from the DB) are offered
 * as suggestions via a native datalist, but any new text is always accepted — so a
 * category added directly in Supabase shows up here without any code change.
 */
export function CategoryInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const { data: categories } = useKnownCategories()

  return (
    <>
      <Input
        list="known-categories"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? 'Category'}
      />
      <datalist id="known-categories">
        {(categories ?? []).map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
    </>
  )
}
