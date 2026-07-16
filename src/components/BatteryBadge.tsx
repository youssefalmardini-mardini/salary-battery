import { BatteryIcon } from '@/components/BatteryIcon'
import { cn } from '@/lib/utils'

export function BatteryBadge({
  percent,
  size = 'sm',
  className,
}: {
  percent: number
  size?: 'sm' | 'lg'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-muted transition-colors hover:bg-muted/70',
        size === 'lg' ? 'gap-2 px-3 py-1.5' : 'gap-1.5 px-2 py-1',
        className,
      )}
      title={`${Math.round(percent)}% saved`}
    >
      <BatteryIcon
        percent={percent}
        className={cn(size === 'lg' ? 'h-7 w-11' : 'h-4 w-6', 'text-muted-foreground')}
      />
      <span className={cn('font-medium tabular-nums text-muted-foreground', size === 'lg' ? 'text-sm' : 'text-xs')}>
        {Math.round(percent)}%
      </span>
    </span>
  )
}
