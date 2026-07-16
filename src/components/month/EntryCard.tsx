import { useState, type ReactNode } from 'react'
import { PencilIcon, XIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function EntryGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

export function EntryCard({
  title,
  subtitle,
  trailing,
  extra,
  accentColor,
  onEdit,
  onDelete,
}: {
  title: string
  subtitle?: string
  trailing?: string
  extra?: ReactNode
  accentColor?: string | null
  onEdit?: () => void
  onDelete: () => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <Card size="sm" style={accentColor ? { backgroundColor: accentColor } : undefined}>
      <CardContent className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{title}</span>
          {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {trailing && <span className="text-xs whitespace-nowrap text-muted-foreground">{trailing}</span>}
          {extra}
          {onEdit && (
            <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit">
              <PencilIcon />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={() => setConfirmOpen(true)} aria-label="Remove">
            <XIcon />
          </Button>
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${title}"?`}
        description="This can't be undone."
        onConfirm={() => {
          onDelete()
          setConfirmOpen(false)
        }}
      />
    </Card>
  )
}
