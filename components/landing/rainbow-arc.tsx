export function RainbowArc({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ filter: "blur(1.5px)" }}
    >
      <defs>
        {/* Each arc band as a gradient */}
        <linearGradient id="rainbow-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C4A8D4" stopOpacity="0.1" />
          <stop offset="20%" stopColor="#C4A8D4" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#C4A8D4" stopOpacity="0.6" />
          <stop offset="80%" stopColor="#C4A8D4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#C4A8D4" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Azzurro (outermost) */}
      <path
        d="M 30 290 A 270 270 0 0 1 570 290"
        stroke="#8EC5E2"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.45"
        fill="none"
      />

      {/* Verde */}
      <path
        d="M 50 290 A 250 250 0 0 1 550 290"
        stroke="#A8D5B0"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.45"
        fill="none"
      />

      {/* Giallo */}
      <path
        d="M 70 290 A 230 230 0 0 1 530 290"
        stroke="#F2DC8A"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      />

      {/* Pesca */}
      <path
        d="M 90 290 A 210 210 0 0 1 510 290"
        stroke="#F5C7A0"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      />

      {/* Lavanda (innermost) */}
      <path
        d="M 110 290 A 190 190 0 0 1 490 290"
        stroke="#C4A8D4"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.45"
        fill="none"
      />

      {/* Soft glow overlay */}
      <path
        d="M 70 290 A 230 230 0 0 1 530 290"
        stroke="white"
        strokeWidth="60"
        strokeLinecap="round"
        opacity="0.08"
        fill="none"
      />
    </svg>
  )
}
