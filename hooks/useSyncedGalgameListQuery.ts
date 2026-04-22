'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMounted } from '~/hooks/useMounted'
import type { SortField, SortOrder } from '~/components/galgame/_sort'
import {
  DEFAULT_GALGAME_SORT_FIELD,
  DEFAULT_GALGAME_SORT_ORDER,
  parsePositiveIntParam
} from '~/utils/galgameFilter'

export interface UseSyncedGalgameListQueryArgs {
  initialPage: number
  initialSortField: SortField
  initialSortOrder: SortOrder
}

/**
 * 将「列表分页 + 排序」与地址栏 `page` / `sortField` / `sortOrder` 双向同步
 *（与原 galgame/Container 中三段逻辑一致；改排序时通过 withPageReset 回到第 1 页）
 */
export function useSyncedGalgameListQuery({
  initialPage,
  initialSortField,
  initialSortOrder
}: UseSyncedGalgameListQueryArgs) {
  const isMounted = useMounted()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(initialPage)
  const [sortField, setSortField] = useState<SortField>(initialSortField)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder)

  const withPageReset = useCallback(
    <T>(setter: (value: T) => void) =>
      (value: T) => {
        setPage(1)
        setter(value)
      },
    []
  )

  // 段 A：state -> URL
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

    if (sortField !== DEFAULT_GALGAME_SORT_FIELD) {
      params.set('sortField', sortField)
    } else {
      params.delete('sortField')
    }

    if (sortOrder !== DEFAULT_GALGAME_SORT_ORDER) {
      params.set('sortOrder', sortOrder)
    } else {
      params.delete('sortOrder')
    }

    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false
      })
    }
  }, [isMounted, page, pathname, router, searchParams, sortField, sortOrder])

  // 段 B：URL + RSC initial* -> state
  useEffect(() => {
    const nextPage = parsePositiveIntParam(
      searchParams.get('page'),
      initialPage
    )
    const nextSortField =
      (searchParams.get('sortField') as SortField) || initialSortField
    const nextSortOrder =
      (searchParams.get('sortOrder') as SortOrder) || initialSortOrder

    setPage((current) => (current === nextPage ? current : nextPage))
    setSortField((current) =>
      current === nextSortField ? current : nextSortField
    )
    setSortOrder((current) =>
      current === nextSortOrder ? current : nextSortOrder
    )
  }, [initialPage, initialSortField, initialSortOrder, searchParams])

  return {
    page,
    setPage,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    setSortFieldWithPageReset: withPageReset(setSortField),
    setSortOrderWithPageReset: withPageReset(setSortOrder)
  }
}
