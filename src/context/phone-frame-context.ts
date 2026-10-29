import { createContext, useContext } from 'react'

/**
 * O nó DOM do "frame" de celular (ver PhoneFrame.tsx). Elementos que
 * precisam ser `position: fixed` relativos ao frame — não à janela toda do
 * navegador — usam isso para fazer portal direto pra dentro dele.
 */
export const PhoneFrameContext = createContext<HTMLDivElement | null>(null)

export function usePhoneFrameElement() {
  return useContext(PhoneFrameContext)
}
