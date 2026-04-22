import type { SortField, SortOrder } from '~/components/galgame/_sort'

export const DEFAULT_GALGAME_SORT_FIELD: SortField = 'created'
export const DEFAULT_GALGAME_SORT_ORDER: SortOrder = 'desc'

export const getSearchParamValue = (
  value: string | string[] | null | undefined
) => {
  return Array.isArray(value) ? value[0] : (value ?? undefined)
}

export const parsePositiveIntParam = (
  value: string | null | undefined,
  fallback: number
) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback
  }

  return Math.floor(parsed)
}
