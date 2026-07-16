import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EntryEditor, type EntryEditorValues } from '@/components/EntryEditor'

export function EntryDialog({
  open,
  onOpenChange,
  title,
  initial,
  showName,
  showCategory,
  requireCategory,
  showFrequency,
  showColor,
  allowShared,
  requireMember,
  isSaving,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  initial: EntryEditorValues
  showName?: boolean
  showCategory?: boolean
  requireCategory?: boolean
  showFrequency?: boolean
  showColor?: boolean
  allowShared?: boolean
  requireMember?: boolean
  isSaving?: boolean
  onSave: (values: EntryEditorValues) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {open && (
          <EntryEditor
            initial={initial}
            showName={showName}
            showCategory={showCategory}
            requireCategory={requireCategory}
            showFrequency={showFrequency}
            showColor={showColor}
            allowShared={allowShared}
            requireMember={requireMember}
            isSaving={isSaving}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
