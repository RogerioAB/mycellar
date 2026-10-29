import { getLabelPhotoUrl } from '../lib/labelPhoto'
import { useSignedUrl } from './useSignedUrl'

export function useLabelPhotoUrl(path: string | null) {
  return useSignedUrl(path, getLabelPhotoUrl)
}
