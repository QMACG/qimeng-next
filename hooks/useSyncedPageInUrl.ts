'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMounted } from '~/hooks/useMounted'
import { parsePositiveIntParam } from '~/utils/galgameFilter'

/**
 * 仅同步分页 `page` 到地址栏，用于无排序筛选的列表（如标签/会社首页）
 */
export function useSyncedPageInUrl(initialPage: number) {
  const isMounted = useMounted()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(initialPage)

  useLayoutEffect(() => {
    const next = parsePositiveIntParam(searchParams.get('page'), initialPage)
    setPage((c) => (c === next ? c : next))
  }, [initialPage, searchParams])

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
    const nextQuery = params.toString()
    const currentQuery = searchParams.toString()
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false
      })
    }
  }, [isMounted, page, pathname, router, searchParams])

  return { page, setPage }
}
