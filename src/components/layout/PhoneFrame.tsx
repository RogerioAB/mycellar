import { useState, type ReactNode } from 'react'
import { PhoneFrameContext } from '../../context/phone-frame-context'

/**
 * Limita o app a uma largura de celular, centralizado na tela, mesmo em
 * monitores grandes — o conteúdo real do app roda SEMPRE em formato mobile.
 *
 * Duas camadas, de propósito:
 * - O div EXTERNO (`node`, com `transform`) é o "viewport fixo": não rola e
 *   é o containing block de filhos `position: fixed` portados pra dentro
 *   dele (BottomNav, BottlePreview — ver usePhoneFrameElement). Um elemento
 *   que rola E é containing block ao mesmo tempo faz filhos `fixed`
 *   rolarem junto com o conteúdo — por isso a rolagem fica isolada no div
 *   INTERNO, que é só um irmão dos elementos portados, nunca ancestral.
 * - O div INTERNO é quem efetivamente rola o conteúdo das páginas.
 *
 * Em telas de celular de verdade (<430px), o frame ocupa 100% da largura e
 * esse comportamento fica idêntico ao de um app mobile normal.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  return (
    <div
      ref={setNode}
      className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-white sm:shadow-2xl"
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="h-full overflow-x-hidden overflow-y-auto">
        <PhoneFrameContext.Provider value={node}>{children}</PhoneFrameContext.Provider>
      </div>
    </div>
  )
}
