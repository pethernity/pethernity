"use client"

import { useEffect, useRef } from "react"

interface CloudLayer {
  src: string
  positions: { x: string; y: string; width: number; rotate?: number }[]
  baseOpacity: number
  fadeRange: [number, number]
  speed: number
  driftDelay: string
}

const LAYERS: CloudLayer[] = [
  {
    src: "/clouds/1.png",
    positions: [
      { x: "-10%", y: "-5%", width: 320 },
      { x: "65%", y: "-3%", width: 300 },
      { x: "30%", y: "75%", width: 280, rotate: 5 },
    ],
    baseOpacity: 0.45,
    fadeRange: [0, 0.25],
    speed: 1.2,
    driftDelay: "0s",
  },
  {
    src: "/clouds/2.png",
    positions: [
      { x: "75%", y: "15%", width: 240, rotate: -3 },
      { x: "-5%", y: "65%", width: 260 },
    ],
    baseOpacity: 0.35,
    fadeRange: [0.05, 0.4],
    speed: 0.8,
    driftDelay: "2s",
  },
  {
    src: "/clouds/3.png",
    positions: [
      { x: "15%", y: "10%", width: 200 },
      { x: "80%", y: "70%", width: 220, rotate: 3 },
    ],
    baseOpacity: 0.25,
    fadeRange: [0.1, 0.5],
    speed: 0.5,
    driftDelay: "4s",
  },
]

export function CloudParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    function update() {
      if (!containerRef.current) return
      const maxScroll = document.body.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0

      const layerEls = containerRef.current.querySelectorAll<HTMLDivElement>("[data-cloud-layer]")
      layerEls.forEach((el) => {
        const fadeStart = parseFloat(el.dataset.fadeStart || "0")
        const fadeEnd = parseFloat(el.dataset.fadeEnd || "1")
        const speed = parseFloat(el.dataset.speed || "1")
        const baseOpacity = parseFloat(el.dataset.baseOpacity || "1")

        let opacity: number
        if (progress <= fadeStart) {
          opacity = baseOpacity
        } else if (progress >= fadeEnd) {
          opacity = 0
        } else {
          opacity = baseOpacity * (1 - (progress - fadeStart) / (fadeEnd - fadeStart))
        }

        const translateY = -(progress * speed * 60)

        el.style.opacity = String(opacity)
        el.style.transform = `translateY(${translateY}px)`
      })
    }

    function onScroll() {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {LAYERS.map((layer, li) => (
        <div
          key={li}
          data-cloud-layer
          data-fade-start={layer.fadeRange[0]}
          data-fade-end={layer.fadeRange[1]}
          data-speed={layer.speed}
          data-base-opacity={layer.baseOpacity}
          className="absolute inset-0 transition-none"
          style={{ opacity: layer.baseOpacity, animationDelay: layer.driftDelay }}
        >
          {layer.positions.map((pos, pi) => (
            <img
              key={pi}
              src={layer.src}
              alt=""
              draggable={false}
              className="absolute select-none animate-cloud-drift"
              style={{
                left: pos.x,
                top: pos.y,
                width: pos.width,
                height: "auto",
                transform: pos.rotate ? `rotate(${pos.rotate}deg)` : undefined,
                animationDelay: `${li * 1.5 + pi * 0.8}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
