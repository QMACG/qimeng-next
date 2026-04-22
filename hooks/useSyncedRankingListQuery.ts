'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMounted } from '~/hooks/useMounted'
import { parsePositiveIntParam } from '~/utils/galgameFilter'
import { RANKING_SORT_FIELDS, type RankingSortField } from '~/types/api/ranking'

type SortOrder = 'asc' | 'desc'

const parseRankingSort = (
  raw: string | null,
  fallback: RankingSortField
): RankingSortField => {
  if (raw && RANKING_SORT_FIELDS.includes(raw as RankingSortField)) {
    return raw as RankingSortField
  }
  return fallback
}

const parseOrder = (raw: string | null, fallback: SortOrder): SortOrder => {
  return raw === 'asc' || raw === 'desc' ? raw : fallback
}

export interface UseSyncedRankingListQueryArgs {
  initialPage: number
  initialSortField: RankingSortField
  initialSortOrder: SortOrder
  initialMinRatingCount: number
  defaultSortField: RankingSortField
  defaultSortOrder: SortOrder
  defaultMinRatingCount: number
}

/**
 * 排行榜：page、sortField、sortOrder、minRatingCount 与地址栏同步
 */
export function useSyncedRankingListQuery({
  initialPage,
  initialSortField,
  initialSortOrder,
  initialMinRatingCount,
  defaultSortField,
  defaultSortOrder,
  defaultMinRatingCount
}: UseSyncedRankingListQueryArgs) {
  const isMounted = useMounted()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(initialPage)
  const [sortField, setSortField] = useState<RankingSortField>(initialSortField)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder)
  const [minRatingCount, setMinRatingCount] = useState(initialMinRatingCount)

  const withPageReset = useCallback(
    <T>(setter: (value: T) => void) =>
      (value: T) => {
        setPage(1)
        setter(value)
      },
    []
  )

  useEffect(() => {
    if (!isMounted) {
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    if (sortField !== defaultSortField) {
      params.set('sortField', sortField)
    } else {
      params.delete('sortField')
    }
    if (sortOrder !== defaultSortOrder) {
      params.set('sortOrder', sortOrder)
    } else {
      params.delete('sortOrder')
    }
    if (minRatingCount !== defaultMinRatingCount) {
      params.set('minRatingCount', String(minRatingCount))
    } else {
      params.delete('minRatingCount')
    }
    const next = params.toString()
    const cur = searchParams.toString()
    if (next !== cur) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [
    defaultMinRatingCount,
    defaultSortField,
    defaultSortOrder,
    isMounted,
    minRatingCount,
    page,
    pathname,
    router,
    searchParams,
    sortField,
    sortOrder
  ])

  useEffect(() => {
    const sp = searchParams
    setPage((c) => {
      const n = parsePositiveIntParam(sp.get('page'), initialPage)
      return c === n ? c : n
    })
    setSortField((c) => {
      const n = parseRankingSort(sp.get('sortField'), initialSortField)
      return c === n ? c : n
    })
    setSortOrder((c) => {
      const n = parseOrder(sp.get('sortOrder'), initialSortOrder)
      return c === n ? c : n
    })
    setMinRatingCount((c) => {
      const raw = sp.get('minRatingCount')
      const parsed = raw != null && raw !== '' ? Number.parseInt(raw, 10) : NaN
      const n = Number.isFinite(parsed)
        ? Math.max(0, Math.floor(parsed))
        : initialMinRatingCount
      return c === n ? c : n
    })
  }, [
    initialPage,
    initialMinRatingCount,
    initialSortField,
    initialSortOrder,
    searchParams
  ])

  return {
    page,
    setPage,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    minRatingCount,
    setMinRatingCount,
    setSortFieldWithPageReset: withPageReset(setSortField),
    setSortOrderWithPageReset: withPageReset(setSortOrder),
    setMinRatingCountWithPageReset: withPageReset(setMinRatingCount)
  }
}
