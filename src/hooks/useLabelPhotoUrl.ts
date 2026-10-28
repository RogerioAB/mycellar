import { useEffect, useState } from 'react'
import { getLabelPhotoUrl } from '../lib/labelPhoto'

export function useLabelPhotoUrl(path: string | null) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!path) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta ao trocar de garrafa/remover a foto
      setUrl(null)
      return
    }
    void getLabelPhotoUrl(path).then((signedUrl) => {
      if (!cancelled) setUrl(signedUrl)
    })
    return () => {
      cancelled = true
    }
  }, [path])

  return url
}
