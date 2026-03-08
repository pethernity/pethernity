import { CLOUD_SPOTS } from "./cloud-spots"

export interface Memorial {
  id: string
  petName: string
  petType: "dog" | "cat" | "other"
  photo: string
  phrase: string
  birthDate?: string
  deathDate?: string
  cloudId: string
  createdAt: string
}

const STORAGE_KEY = "pethernity-memorials"

/** Migrate old position-based memorials to cloudId */
function migrateMemorials(raw: unknown[]): Memorial[] {
  const occupied = new Set<string>()
  return raw.map((entry) => {
    const m = entry as Record<string, unknown>
    if (m.cloudId && typeof m.cloudId === "string") {
      occupied.add(m.cloudId)
      return m as unknown as Memorial
    }
    // Old format: has position { x, y } — find nearest available cloud
    const pos = m.position as { x: number; y: number } | undefined
    let bestId = CLOUD_SPOTS[0].id
    if (pos) {
      let bestDist = Infinity
      for (const spot of CLOUD_SPOTS) {
        if (occupied.has(spot.id)) continue
        const dx = spot.x - pos.x
        const dy = spot.y - pos.y
        const dist = dx * dx + dy * dy
        if (dist < bestDist) {
          bestDist = dist
          bestId = spot.id
        }
      }
    }
    occupied.add(bestId)
    const { position: _, ...rest } = m as Record<string, unknown> & { position?: unknown }
    return { ...rest, cloudId: bestId } as unknown as Memorial
  })
}

export function getMemorials(): Memorial[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown[]
    const needsMigration = parsed.some(
      (e) => (e as Record<string, unknown>).position !== undefined
    )
    if (needsMigration) {
      const migrated = migrateMemorials(parsed)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      return migrated
    }
    return parsed as Memorial[]
  } catch {
    return []
  }
}

export function getMemorial(id: string): Memorial | undefined {
  return getMemorials().find((m) => m.id === id)
}

export function saveMemorial(memorial: Memorial): void {
  const memorials = getMemorials()
  memorials.push(memorial)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memorials))
}

export function createMemorialId(): string {
  return crypto.randomUUID()
}

export function getOccupiedCloudIds(): Set<string> {
  return new Set(getMemorials().map((m) => m.cloudId))
}
