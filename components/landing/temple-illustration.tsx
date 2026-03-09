export function TempleIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Base platform */}
      <rect x="40" y="260" width="320" height="16" rx="3" fill="#C9A84C" opacity="0.5" />
      <rect x="30" y="272" width="340" height="12" rx="3" fill="#C9A84C" opacity="0.35" />
      <rect x="20" y="280" width="360" height="14" rx="3" fill="#C9A84C" opacity="0.25" />

      {/* Steps */}
      <rect x="60" y="248" width="280" height="14" rx="2" fill="#F5EDE0" opacity="0.6" />
      <rect x="50" y="258" width="300" height="6" rx="1" fill="#C9A84C" opacity="0.3" />

      {/* Left column */}
      <rect x="80" y="100" width="16" height="150" rx="8" fill="#F5EDE0" opacity="0.7" />
      <rect x="76" y="96" width="24" height="10" rx="2" fill="#C9A84C" opacity="0.5" />
      <rect x="76" y="248" width="24" height="6" rx="2" fill="#C9A84C" opacity="0.5" />
      {/* Left column flutes */}
      <line x1="84" y1="106" x2="84" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <line x1="88" y1="106" x2="88" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <line x1="92" y1="106" x2="92" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />

      {/* Center-left column */}
      <rect x="150" y="100" width="16" height="150" rx="8" fill="#F5EDE0" opacity="0.7" />
      <rect x="146" y="96" width="24" height="10" rx="2" fill="#C9A84C" opacity="0.5" />
      <rect x="146" y="248" width="24" height="6" rx="2" fill="#C9A84C" opacity="0.5" />
      <line x1="154" y1="106" x2="154" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <line x1="158" y1="106" x2="158" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <line x1="162" y1="106" x2="162" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />

      {/* Center-right column */}
      <rect x="234" y="100" width="16" height="150" rx="8" fill="#F5EDE0" opacity="0.7" />
      <rect x="230" y="96" width="24" height="10" rx="2" fill="#C9A84C" opacity="0.5" />
      <rect x="230" y="248" width="24" height="6" rx="2" fill="#C9A84C" opacity="0.5" />
      <line x1="238" y1="106" x2="238" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <line x1="242" y1="106" x2="242" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <line x1="246" y1="106" x2="246" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />

      {/* Right column */}
      <rect x="304" y="100" width="16" height="150" rx="8" fill="#F5EDE0" opacity="0.7" />
      <rect x="300" y="96" width="24" height="10" rx="2" fill="#C9A84C" opacity="0.5" />
      <rect x="300" y="248" width="24" height="6" rx="2" fill="#C9A84C" opacity="0.5" />
      <line x1="308" y1="106" x2="308" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <line x1="312" y1="106" x2="312" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
      <line x1="316" y1="106" x2="316" y2="248" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />

      {/* Architrave / entablature */}
      <rect x="65" y="88" width="270" height="12" rx="2" fill="#C9A84C" opacity="0.45" />

      {/* Pediment (triangular) */}
      <polygon
        points="200,30 65,88 335,88"
        fill="#F5EDE0"
        opacity="0.6"
        stroke="#C9A84C"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Inner pediment decoration — heart/paw */}
      <text
        x="200"
        y="72"
        textAnchor="middle"
        fontSize="20"
        fill="#C9A84C"
        opacity="0.6"
      >
        &#x1F43E;
      </text>

      {/* Light rays from center */}
      <line x1="200" y1="140" x2="200" y2="240" stroke="#C9A84C" strokeWidth="0.5" opacity="0.15" />
      <line x1="170" y1="140" x2="160" y2="240" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1" />
      <line x1="230" y1="140" x2="240" y2="240" stroke="#C9A84C" strokeWidth="0.3" opacity="0.1" />
    </svg>
  )
}
