export interface CloudSpot {
  id: string
  x: number
  y: number
  width: number
  height: number
  variant: 1 | 2 | 3
}

export const CLOUD_SPOTS: CloudSpot[] = [
  // Center ring — arranged around the central temple at (2000, 1200)
  { id: "cloud-01", x: 1400, y: 900, width: 320, height: 150, variant: 1 },
  { id: "cloud-02", x: 2000, y: 720, width: 280, height: 130, variant: 2 },
  { id: "cloud-03", x: 2600, y: 900, width: 350, height: 160, variant: 3 },
  { id: "cloud-04", x: 2750, y: 1200, width: 300, height: 140, variant: 1 },
  { id: "cloud-05", x: 2600, y: 1520, width: 260, height: 120, variant: 2 },
  { id: "cloud-06", x: 2000, y: 1650, width: 340, height: 155, variant: 3 },
  { id: "cloud-07", x: 1400, y: 1520, width: 290, height: 135, variant: 1 },
  { id: "cloud-08", x: 1250, y: 1200, width: 310, height: 145, variant: 2 },

  // Upper-left quadrant
  { id: "cloud-09", x: 400, y: 300, width: 280, height: 130, variant: 3 },
  { id: "cloud-10", x: 750, y: 450, width: 350, height: 160, variant: 1 },
  { id: "cloud-11", x: 300, y: 650, width: 240, height: 110, variant: 2 },
  { id: "cloud-12", x: 600, y: 200, width: 300, height: 140, variant: 3 },
  { id: "cloud-13", x: 950, y: 350, width: 270, height: 125, variant: 1 },

  // Upper-right quadrant
  { id: "cloud-14", x: 3200, y: 250, width: 320, height: 150, variant: 2 },
  { id: "cloud-15", x: 3550, y: 400, width: 280, height: 130, variant: 3 },
  { id: "cloud-16", x: 2900, y: 350, width: 360, height: 165, variant: 1 },
  { id: "cloud-17", x: 3400, y: 600, width: 250, height: 115, variant: 2 },
  { id: "cloud-18", x: 3700, y: 300, width: 300, height: 140, variant: 3 },

  // Left edge
  { id: "cloud-19", x: 250, y: 1100, width: 290, height: 135, variant: 1 },
  { id: "cloud-20", x: 500, y: 1400, width: 330, height: 155, variant: 2 },
  { id: "cloud-21", x: 350, y: 1700, width: 260, height: 120, variant: 3 },
  { id: "cloud-22", x: 700, y: 800, width: 310, height: 145, variant: 1 },

  // Right edge
  { id: "cloud-23", x: 3600, y: 1100, width: 300, height: 140, variant: 2 },
  { id: "cloud-24", x: 3350, y: 1350, width: 280, height: 130, variant: 3 },
  { id: "cloud-25", x: 3750, y: 1500, width: 340, height: 155, variant: 1 },
  { id: "cloud-26", x: 3500, y: 900, width: 270, height: 125, variant: 2 },

  // Lower-left quadrant
  { id: "cloud-27", x: 400, y: 2000, width: 320, height: 150, variant: 3 },
  { id: "cloud-28", x: 800, y: 1850, width: 290, height: 135, variant: 1 },
  { id: "cloud-29", x: 550, y: 2200, width: 250, height: 115, variant: 2 },
  { id: "cloud-30", x: 1000, y: 2050, width: 360, height: 165, variant: 3 },

  // Lower-right quadrant
  { id: "cloud-31", x: 3200, y: 1900, width: 300, height: 140, variant: 1 },
  { id: "cloud-32", x: 3500, y: 2100, width: 280, height: 130, variant: 2 },
  { id: "cloud-33", x: 2900, y: 2150, width: 340, height: 155, variant: 3 },
  { id: "cloud-34", x: 3650, y: 1800, width: 260, height: 120, variant: 1 },

  // Lower-center
  { id: "cloud-35", x: 1800, y: 1900, width: 310, height: 145, variant: 2 },
  { id: "cloud-36", x: 2200, y: 2050, width: 290, height: 135, variant: 3 },
  { id: "cloud-37", x: 1500, y: 2100, width: 270, height: 125, variant: 1 },
  { id: "cloud-38", x: 2500, y: 1850, width: 350, height: 160, variant: 2 },

  // Upper-center fill
  { id: "cloud-39", x: 1300, y: 400, width: 300, height: 140, variant: 3 },
  { id: "cloud-40", x: 1600, y: 600, width: 330, height: 150, variant: 1 },
]

export function getCloudSpot(cloudId: string): CloudSpot | undefined {
  return CLOUD_SPOTS.find((s) => s.id === cloudId)
}

const MAP_CENTER_X = 2000
const MAP_CENTER_Y = 1200

export function getNextAvailableCloudId(occupiedIds: Set<string>): string | null {
  const sorted = [...CLOUD_SPOTS].sort((a, b) => {
    const da = (a.x - MAP_CENTER_X) ** 2 + (a.y - MAP_CENTER_Y) ** 2
    const db = (b.x - MAP_CENTER_X) ** 2 + (b.y - MAP_CENTER_Y) ** 2
    return da - db
  })
  const available = sorted.find((s) => !occupiedIds.has(s.id))
  return available?.id ?? null
}
