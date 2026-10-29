import type { Bottle, WineType } from '../types/bottle'

export interface BottleFilterValue {
  wineType: WineType | null
  country: string | null
  grape: string | null
  vintageYear: number | null
}

export const EMPTY_FILTER: BottleFilterValue = {
  wineType: null,
  country: null,
  grape: null,
  vintageYear: null,
}

export function isFilterActive(filter: BottleFilterValue): boolean {
  return Object.values(filter).some((v) => v !== null)
}

export function bottleMatchesFilter(bottle: Bottle, filter: BottleFilterValue): boolean {
  if (filter.wineType && bottle.wine_type !== filter.wineType) return false
  if (filter.country && bottle.country !== filter.country) return false
  if (filter.grape && !(bottle.grapes ?? []).includes(filter.grape)) return false
  if (filter.vintageYear && bottle.vintage_year !== filter.vintageYear) return false
  return true
}

function uniqueSorted<T>(values: (T | null | undefined)[]): T[] {
  return Array.from(new Set(values.filter((v): v is T => v !== null && v !== undefined))).sort()
}

export function getFilterOptions(bottles: Bottle[]) {
  return {
    countries: uniqueSorted(bottles.map((b) => b.country)),
    grapes: uniqueSorted(bottles.flatMap((b) => b.grapes ?? [])),
    vintageYears: uniqueSorted(bottles.map((b) => b.vintage_year)).sort((a, b) => b - a),
  }
}
