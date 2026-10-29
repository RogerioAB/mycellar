import { getSignedUrl, uploadToBucket } from './storage'

const BUCKET = 'cellar-photos'

/** Objeto único por usuário — upsert sobrescreve a foto de fundo anterior. */
export async function uploadCellarPhoto(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/background.${ext}`
  return uploadToBucket(BUCKET, path, file, true)
}

export async function getCellarPhotoUrl(path: string): Promise<string | null> {
  return getSignedUrl(BUCKET, path)
}
