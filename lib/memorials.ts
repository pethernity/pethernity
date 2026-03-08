export interface Memorial {
  id: string
  petName: string
  petType: "dog" | "cat" | "other"
  photo: string
  phrase: string
  birthDate?: string
  deathDate?: string
  position: { x: number; y: number }
  createdAt: string
}

const STORAGE_KEY = "pethernity-memorials"

export function getMemorials(): Memorial[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Memorial[]
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
