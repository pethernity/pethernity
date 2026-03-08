export function CloudOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Layer 1 — large slow clouds */}
      <div className="animate-cloud-drift-slow absolute -top-10 left-0 h-40 w-full opacity-40">
        <svg viewBox="0 0 1200 200" className="h-full w-full" preserveAspectRatio="none">
          <ellipse cx="200" cy="100" rx="180" ry="70" fill="white" />
          <ellipse cx="350" cy="80" rx="140" ry="60" fill="white" />
          <ellipse cx="280" cy="110" rx="160" ry="50" fill="white" />
          <ellipse cx="700" cy="90" rx="200" ry="80" fill="white" />
          <ellipse cx="850" cy="70" rx="150" ry="60" fill="white" />
          <ellipse cx="780" cy="100" rx="170" ry="55" fill="white" />
          <ellipse cx="1100" cy="95" rx="160" ry="65" fill="white" />
        </svg>
      </div>
      {/* Layer 2 — medium clouds */}
      <div className="animate-cloud-drift-medium absolute top-20 left-0 h-32 w-full opacity-25">
        <svg viewBox="0 0 1200 160" className="h-full w-full" preserveAspectRatio="none">
          <ellipse cx="100" cy="80" rx="120" ry="50" fill="white" />
          <ellipse cx="500" cy="70" rx="160" ry="60" fill="white" />
          <ellipse cx="620" cy="90" rx="130" ry="45" fill="white" />
          <ellipse cx="950" cy="75" rx="140" ry="55" fill="white" />
        </svg>
      </div>
      {/* Layer 3 — small fast wisps */}
      <div className="animate-cloud-drift-fast absolute bottom-10 left-0 h-24 w-full opacity-15">
        <svg viewBox="0 0 1200 120" className="h-full w-full" preserveAspectRatio="none">
          <ellipse cx="300" cy="60" rx="100" ry="35" fill="white" />
          <ellipse cx="800" cy="50" rx="80" ry="30" fill="white" />
        </svg>
      </div>
    </div>
  )
}
