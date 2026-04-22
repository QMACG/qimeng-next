'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMounted } from '~/hooks/useMounted'
import type { SortDirection, SortOption } from '~/components/comment/_sort'
import { parsePositiveIntParam } from '~/utils/galgameFilter'

const SORT_OPTIONS: SortOption[] = ['created', 'like']

const parseSortField = (
  raw: string | null,
  fallback: SortOption
): SortOption => {
  if (raw && SORT_OPTIONS.includes(raw as SortOption)) {
    return raw as SortOption
  }
  return fallback
}

const parseSortOrder = (
  raw: string | null,
  fallback: SortDirection
): SortDirection => {
  return raw === 'asc' || raw === 'desc' ? raw : fallback
}

export interface UseSyncedCommentListQueryArgs {
  initialPage: number
  initialSortField: SortOption
  initialSortOrder: SortDirection
  defaultSortField: SortOption
  defaultSortOrder: SortDirection
}

/**
 * 全站评论列表：与 `page` / `sortField` / `sortOrder` 同步
 */
export function useSyncedCommentListQuery({
  initialPage,
  initialSortField,
  initialSortOrder,
  defaultSortField,
  defaultSortOrder
}: UseSyncedCommentListQueryArgs) {
  const isMounted = useMounted()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(initialPage)
  const [sortField, setSortField] = useState<SortOption>(initialSortField)
  const [sortOrder, setSortOrder] = useState<SortDirection>(initialSortOrder)

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
    const next = params.toString()
    const cur = searchParams.toString()
    if (next !== cur) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [
    defaultSortField,
    defaultSortOrder,
    isMounted,
    page,
    pathname,
    router,
    searchParams,
    sortField,
    sortOrder
  ])

  useEffect(() => {
    const nPage = parsePositiveIntParam(searchParams.get('page'), initialPage)
    const nField = parseSortField(
      searchParams.get('sortField'),
      initialSortField
    )
    const nOrder = parseSortOrder(
      searchParams.get('sortOrder'),
      initialSortOrder
    )
    setPage((c) => (c === nPage ? c : nPage))
    setSortField((c) => (c === nField ? c : nField))
    setSortOrder((c) => (c === nOrder ? c : nOrder))
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
