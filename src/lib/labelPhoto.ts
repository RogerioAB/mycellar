import { getSignedUrl, uploadToBucket } from './storage'

const BUCKET = 'label-photos'

export async function uploadLabelPhoto(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  return uploadToBucket(BUCKET, path, file)
}

export async function getLabelPhotoUrl(path: string): Promise<string | null> {
  return getSignedUrl(BUCKET, path)
}
