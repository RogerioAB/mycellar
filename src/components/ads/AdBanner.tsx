import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined
const SLOT_ID = import.meta.env.VITE_ADSENSE_SLOT_ID as string | undefined

let scriptInjected = false

function ensureScriptLoaded(clientId: string) {
  if (scriptInjected) return
  scriptInjected = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

/**
 * Banner do Google AdSense. Se as env vars não estiverem configuradas
 * (dev local, ou antes de aprovação da conta AdSense), não renderiza nada.
 */
export function AdBanner() {
  const insRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    if (!CLIENT_ID || !SLOT_ID) return
    ensureScriptLoaded(CLIENT_ID)
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // ambiente sem rede/bloqueador de anúncios — ignora silenciosamente
    }
  }, [])

  if (!CLIENT_ID || !SLOT_ID) return null

  return (
    <ins
      ref={insRef}
      className="adsbygoogle block"
      style={{ display: 'block' }}
      data-ad-client={CLIENT_ID}
      data-ad-slot={SLOT_ID}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
