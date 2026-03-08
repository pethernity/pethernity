export function Rainbow({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <img
        src="/rainbow/1.png"
        alt=""
        draggable={false}
        className="h-full w-full object-contain opacity-60 pointer-events-none select-none"
      />
    </div>
  )
}
