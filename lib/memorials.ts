import { createClient } from "@/lib/supabase/client"
import { CLOUD_SPOTS } from "./cloud-spots"

export interface Memorial {
  id: string
  user_id: string
  pet_name: string
  pet_type: "dog" | "cat" | "other"
  photo_url: string
  phrase: string
  birth_date: string | null
  death_date: string | null
  cloud_id: string
  created_at: string
}

export async function getMemorials(): Promise<Memorial[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching memorials:", error)
    return []
  }
  return data as Memorial[]
}

export async function getMemorial(id: string): Promise<Memorial | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as Memorial
}

export async function saveMemorial(
  memorial: Omit<Memorial, "id" | "created_at">
): Promise<Memorial | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("memorials")
    .insert(memorial)
    .select()
    .single()

  if (error) {
    console.error("Error saving memorial:", error)
    return null
  }
  return data as Memorial
}

export async function deleteMemorial(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("memorials").delete().eq("id", id)
  return !error
}

export async function getOccupiedCloudIds(): Promise<Set<string>> {
  const memorials = await getMemorials()
  return new Set(memorials.map((m) => m.cloud_id))
}

export async function uploadMemorialPhoto(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from("memorial-photos")
    .upload(path, file)

  if (error) {
    console.error("Error uploading photo:", error)
    return null
  }

  const { data } = supabase.storage
    .from("memorial-photos")
    .getPublicUrl(path)

  return data.publicUrl
}
