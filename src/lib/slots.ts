import type { SlotRef } from '../hooks/useBottles'
import type { Bottle, Shelf } from '../types/bottle'

export function getOccupiedSet(bottles: Bottle[]): Set<string> {
  const set = new Set<string>()
  for (const b of bottles) {
    if (b.shelf_id && b.slot_index !== null) set.add(`${b.shelf_id}:${b.slot_index}`)
  }
  return set
}

export function isSlotOccupied(occupied: Set<string>, shelfId: string, slotIndex: number) {
  return occupied.has(`${shelfId}:${slotIndex}`)
}

/**
 * Lista todos os slots livres, em ordem de prateleira/posição. Se `preferred` for
 * dado e estiver livre, ele vem primeiro — garante que o slot em que o usuário
 * clicou (vindo do EmptySlot) seja o primeiro escolhido.
 */
export function listFreeSlots(shelves: Shelf[], bottles: Bottle[], preferred?: SlotRef): SlotRef[] {
  const occupied = getOccupiedSet(bottles)
  const free: SlotRef[] = []

  if (preferred && !isSlotOccupied(occupied, preferred.shelfId, preferred.slotIndex)) {
    free.push(preferred)
  }

  for (const shelf of shelves) {
    for (let slotIndex = 0; slotIndex < shelf.capacity; slotIndex++) {
      if (isSlotOccupied(occupied, shelf.id, slotIndex)) continue
      if (preferred && shelf.id === preferred.shelfId && slotIndex === preferred.slotIndex) continue
      free.push({ shelfId: shelf.id, slotIndex })
    }
  }

  return free
}
