import { useTranslation } from 'react-i18next'
import { WINE_TYPES } from '../../types/bottle'
import { getFilterOptions, isFilterActive, type BottleFilterValue } from '../../lib/bottleFilter'
import type { Bottle } from '../../types/bottle'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

export function BottleFilterPanel({
  bottles,
  value,
  onChange,
  matchCount,
}: {
  bottles: Bottle[]
  value: BottleFilterValue
  onChange: (next: BottleFilterValue) => void
  matchCount: number
}) {
  const { t } = useTranslation()
  const options = getFilterOptions(bottles)
  const active = isFilterActive(value)

  return (
    <div className="mx-4 flex flex-col gap-3 rounded-xl border border-cellar-700/30 bg-cellar-800 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={value.wineType ?? ''}
          onChange={(e) => onChange({ ...value, wineType: (e.target.value || null) as never })}
          className="!border-cellar-700/30 !bg-cellar-900 !text-cellar-50"
        >
          <option value="">{t('cellarFilter.allTypes')}</option>
          {WINE_TYPES.map((wt) => (
            <option key={wt} value={wt}>
              {t(`bottle.types.${wt}`)}
            </option>
          ))}
        </Select>

        <Select
          value={value.country ?? ''}
          onChange={(e) => onChange({ ...value, country: e.target.value || null })}
          className="!border-cellar-700/30 !bg-cellar-900 !text-cellar-50"
        >
          <option value="">{t('cellarFilter.allCountries')}</option>
          {options.countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select
          value={value.grape ?? ''}
          onChange={(e) => onChange({ ...value, grape: e.target.value || null })}
          className="!border-cellar-700/30 !bg-cellar-900 !text-cellar-50"
        >
          <option value="">{t('cellarFilter.allGrapes')}</option>
          {options.grapes.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>

        <Select
          value={value.vintageYear ?? ''}
          onChange={(e) => onChange({ ...value, vintageYear: e.target.value ? Number(e.target.value) : null })}
          className="!border-cellar-700/30 !bg-cellar-900 !text-cellar-50"
        >
          <option value="">{t('cellarFilter.allYears')}</option>
          {options.vintageYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      {active && (
        <div className="flex items-center justify-between text-sm text-cellar-50/80">
          <span>{t('cellarFilter.matchCount', { count: matchCount })}</span>
          <Button variant="ghost" className="text-wine-400" onClick={() => onChange({ wineType: null, country: null, grape: null, vintageYear: null })}>
            {t('cellarFilter.clear')}
          </Button>
        </div>
      )}
    </div>
  )
}
