import { useEffect, useState } from 'react'

export function useSignedUrl(path: string | null, resolver: (path: string) => Promise<string | null>) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!path) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta ao trocar/remover a foto
      setUrl(null)
      return
    }
    void resolver(path).then((signedUrl) => {
      if (!cancelled) setUrl(signedUrl)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `resolver` é estável por chamada (helper puro)
  }, [path])

  return url
}
