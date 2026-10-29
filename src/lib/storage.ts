import { supabase } from './supabaseClient'

export async function uploadToBucket(bucket: string, path: string, file: File, upsert = false): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert })
  if (error) throw error
  return path
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) return null
  return data.signedUrl
}
