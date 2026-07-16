export function AppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="14" width="36" height="20" rx="6" stroke="currentColor" strokeWidth="3" />
      <rect x="41" y="20" width="4" height="8" rx="1.5" fill="currentColor" />
      <rect x="8" y="18" width="21" height="12" rx="3" fill="var(--savings)" />
      <text
        x="18.5"
        y="27.3"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="var(--savings-foreground)"
      >
        €
      </text>
    </svg>
  )
}
