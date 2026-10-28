import { Link } from 'react-router-dom'

export function EmptySlot({ shelfId, slotIndex }: { shelfId: string; slotIndex: number }) {
  return (
    <Link
      to={`/bottles/add?shelfId=${shelfId}&slot=${slotIndex}`}
      className="flex aspect-[2/5] min-h-11 flex-1 items-center justify-center rounded-md border-2 border-dashed border-cellar-700/30 text-cellar-700/50 hover:border-wine-700/50 hover:text-wine-700"
      aria-label="Adicionar garrafa nesta posição"
    >
      <span className="text-xl leading-none">+</span>
    </Link>
  )
}
