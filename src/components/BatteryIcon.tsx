const INNER_X = 7
const INNER_Y = 17
const INNER_WIDTH = 30
const INNER_HEIGHT = 14

export function BatteryIcon({ percent, className }: { percent: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const fillWidth = (clamped / 100) * INNER_WIDTH
  const color = percent < 0 ? 'var(--destructive)' : percent < 15 ? '#d97706' : 'var(--savings)'

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label={`${Math.round(percent)}% saved`}
    >
      <rect x="4" y="14" width="36" height="20" rx="6" stroke="currentColor" strokeWidth="3" />
      <rect x="41" y="20" width="4" height="8" rx="1.5" fill="currentColor" />
      {fillWidth > 0 && (
        <rect x={INNER_X} y={INNER_Y} width={fillWidth} height={INNER_HEIGHT} rx="2" fill={color} />
      )}
    </svg>
  )
}
