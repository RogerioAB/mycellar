import type { ReactNode } from 'react'

/**
 * Limita o app a uma largura de celular, centralizado na tela, mesmo em
 * monitores grandes — o conteúdo real do app roda SEMPRE em formato mobile.
 *
 * O `transform` (sem efeito visual) é o que faz elementos `fixed` dentro do
 * app (BottomNav, BottlePreview) se ancorarem neste frame em vez da janela
 * inteira do navegador — é o truque padrão de CSS para "viewport" falso.
 * Em telas de celular de verdade (<430px), o frame ocupa 100% da largura e
 * esse comportamento fica idêntico ao de um app mobile normal.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto h-dvh w-full max-w-[430px] overflow-x-hidden overflow-y-auto bg-white sm:shadow-2xl"
      style={{ transform: 'translateZ(0)' }}
    >
      {children}
    </div>
  )
}
