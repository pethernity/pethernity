export function Rainbow({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 600 300" className="h-full w-full opacity-30">
        <defs>
          <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--rainbow-azzurro)" />
            <stop offset="25%" stopColor="var(--rainbow-verde)" />
            <stop offset="50%" stopColor="var(--rainbow-giallo)" />
            <stop offset="75%" stopColor="var(--rainbow-pesca)" />
            <stop offset="100%" stopColor="var(--rainbow-lavanda)" />
          </linearGradient>
        </defs>
        <path
          d="M 50 280 Q 300 -50 550 280"
          stroke="url(#rainbow-grad)"
          strokeWidth="30"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 70 280 Q 300 -20 530 280"
          stroke="url(#rainbow-grad)"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}
