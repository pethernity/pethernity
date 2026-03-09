import Link from "next/link"

export function ParadiseTemple({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`block cursor-pointer ${className}`}>
      <svg
        viewBox="0 0 700 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Il Tempio dell'Arcobaleno — torna alla home"
      >
        <defs>
          {/* Radial glow behind temple */}
          <radialGradient id="temple-glow-bg" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#F2DC8A" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </radialGradient>

          {/* Waterfall gradient */}
          <linearGradient id="waterfall-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8EC5E2" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#B8D4E3" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8EC5E2" stopOpacity="0.2" />
          </linearGradient>

          {/* Pool water */}
          <radialGradient id="pool-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8EC5E2" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B8D4E3" stopOpacity="0.15" />
          </radialGradient>

          {/* Dome gold gradient */}
          <linearGradient id="dome-grad" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#F2DC8A" />
            <stop offset="60%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#B8952E" />
          </linearGradient>

          {/* Light rays gradient */}
          <linearGradient id="ray-grad" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#F2DC8A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F2DC8A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <ellipse cx="350" cy="240" rx="340" ry="260" fill="url(#temple-glow-bg)" />

        {/* Light rays from dome (pre-computed to avoid hydration mismatch) */}
        <line x1="350" y1="120" x2="650" y2="120" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="610" y2="-30" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="500" y2="-140" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="350" y2="-180" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="200" y2="-140" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="90" y2="-30" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="50" y2="120" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="90" y2="270" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="200" y2="380" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="350" y2="420" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="500" y2="380" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />
        <line x1="350" y1="120" x2="610" y2="270" stroke="#F2DC8A" strokeWidth="1" opacity="0.12" />

        {/* ── Base platform (3 steps) ── */}
        <rect x="80" y="400" width="540" height="20" rx="4" fill="#C9A84C" opacity="0.35" />
        <rect x="65" y="416" width="570" height="16" rx="4" fill="#C9A84C" opacity="0.25" />
        <rect x="50" y="428" width="600" height="18" rx="4" fill="#C9A84C" opacity="0.18" />

        {/* Step surfaces */}
        <rect x="100" y="385" width="500" height="18" rx="3" fill="#F5EDE0" opacity="0.6" />
        <rect x="90" y="398" width="520" height="6" rx="2" fill="#C9A84C" opacity="0.3" />

        {/* ── Columns (6) ── */}
        {/* Column 1 */}
        <rect x="120" y="170" width="18" height="218" rx="9" fill="#F5EDE0" opacity="0.8" />
        <rect x="115" y="164" width="28" height="12" rx="3" fill="#C9A84C" opacity="0.6" />
        <rect x="115" y="385" width="28" height="8" rx="2" fill="#C9A84C" opacity="0.5" />

        {/* Column 2 */}
        <rect x="210" y="170" width="18" height="218" rx="9" fill="#F5EDE0" opacity="0.8" />
        <rect x="205" y="164" width="28" height="12" rx="3" fill="#C9A84C" opacity="0.6" />
        <rect x="205" y="385" width="28" height="8" rx="2" fill="#C9A84C" opacity="0.5" />

        {/* Column 3 */}
        <rect x="300" y="170" width="18" height="218" rx="9" fill="#F5EDE0" opacity="0.8" />
        <rect x="295" y="164" width="28" height="12" rx="3" fill="#C9A84C" opacity="0.6" />
        <rect x="295" y="385" width="28" height="8" rx="2" fill="#C9A84C" opacity="0.5" />

        {/* Column 4 */}
        <rect x="382" y="170" width="18" height="218" rx="9" fill="#F5EDE0" opacity="0.8" />
        <rect x="377" y="164" width="28" height="12" rx="3" fill="#C9A84C" opacity="0.6" />
        <rect x="377" y="385" width="28" height="8" rx="2" fill="#C9A84C" opacity="0.5" />

        {/* Column 5 */}
        <rect x="472" y="170" width="18" height="218" rx="9" fill="#F5EDE0" opacity="0.8" />
        <rect x="467" y="164" width="28" height="12" rx="3" fill="#C9A84C" opacity="0.6" />
        <rect x="467" y="385" width="28" height="8" rx="2" fill="#C9A84C" opacity="0.5" />

        {/* Column 6 */}
        <rect x="562" y="170" width="18" height="218" rx="9" fill="#F5EDE0" opacity="0.8" />
        <rect x="557" y="164" width="28" height="12" rx="3" fill="#C9A84C" opacity="0.6" />
        <rect x="557" y="385" width="28" height="8" rx="2" fill="#C9A84C" opacity="0.5" />

        {/* ── Architrave ── */}
        <rect x="105" y="152" width="490" height="16" rx="3" fill="#C9A84C" opacity="0.5" />

        {/* ── Dome / Arch ── */}
        <path
          d="M 180 152 Q 350 20 520 152"
          fill="url(#dome-grad)"
          opacity="0.55"
          stroke="#C9A84C"
          strokeWidth="2"
          strokeOpacity="0.4"
        />

        {/* Inner dome highlight */}
        <path
          d="M 220 152 Q 350 50 480 152"
          fill="none"
          stroke="#F2DC8A"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Dome top ornament — golden sphere */}
        <circle cx="350" cy="55" r="14" fill="#C9A84C" opacity="0.7" />
        <circle cx="350" cy="55" r="9" fill="#F2DC8A" opacity="0.6" />

        {/* Paw symbol on dome */}
        <text
          x="350"
          y="112"
          textAnchor="middle"
          fontSize="28"
          fill="#C9A84C"
          opacity="0.7"
        >
          &#x1F43E;
        </text>

        {/* ── Waterfalls ── */}
        {/* Left waterfall */}
        <rect x="95" y="400" width="30" height="90" rx="6" fill="url(#waterfall-grad)" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="102" y="410" width="16" height="80" rx="4" fill="#8EC5E2" opacity="0.3">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
        </rect>

        {/* Right waterfall */}
        <rect x="575" y="400" width="30" height="90" rx="6" fill="url(#waterfall-grad)" opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.2s" repeatCount="indefinite" />
        </rect>
        <rect x="582" y="410" width="16" height="80" rx="4" fill="#8EC5E2" opacity="0.3">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.7s" repeatCount="indefinite" />
        </rect>

        {/* Water pools at base */}
        <ellipse cx="110" cy="495" rx="50" ry="14" fill="url(#pool-grad)" />
        <ellipse cx="590" cy="495" rx="50" ry="14" fill="url(#pool-grad)" />

        {/* Water splash particles */}
        <circle cx="90" cy="488" r="3" fill="#8EC5E2" opacity="0.3">
          <animate attributeName="cy" values="488;482;488" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="130" cy="485" r="2" fill="#8EC5E2" opacity="0.25">
          <animate attributeName="cy" values="485;478;485" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="570" cy="486" r="3" fill="#8EC5E2" opacity="0.3">
          <animate attributeName="cy" values="486;480;486" dur="1.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="610" cy="488" r="2" fill="#8EC5E2" opacity="0.25">
          <animate attributeName="cy" values="488;481;488" dur="1.6s" repeatCount="indefinite" />
        </circle>

        {/* ── Floating golden particles ── */}
        {[
          { cx: 180, cy: 100, r: 2.5, dur: "3s", delay: "0s" },
          { cx: 520, cy: 90, r: 2, dur: "3.5s", delay: "0.5s" },
          { cx: 280, cy: 60, r: 1.5, dur: "4s", delay: "1s" },
          { cx: 420, cy: 70, r: 2, dur: "3.2s", delay: "1.5s" },
          { cx: 150, cy: 200, r: 1.5, dur: "3.8s", delay: "0.8s" },
          { cx: 550, cy: 180, r: 2, dur: "3.3s", delay: "1.2s" },
          { cx: 350, cy: 30, r: 3, dur: "4s", delay: "0.3s" },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#F2DC8A" opacity="0.5">
            <animate
              attributeName="cy"
              values={`${p.cy};${p.cy - 8};${p.cy}`}
              dur={p.dur}
              begin={p.delay}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur={p.dur}
              begin={p.delay}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* ── Label ── */}
        <text
          x="350"
          y="530"
          textAnchor="middle"
          fontSize="18"
          fontFamily="serif"
          fill="#C9A84C"
          opacity="0.7"
          fontWeight="bold"
        >
          Il Tempio dell&apos;Arcobaleno
        </text>
      </svg>
    </Link>
  )
}
