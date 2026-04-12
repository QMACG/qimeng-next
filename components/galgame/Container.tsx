'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { kunFetchGet } from '~/utils/kunFetch'
import { GalgameCard } from './Card'
import { FilterBar } from './FilterBar'
import { useMounted } from '~/hooks/useMounted'
import { KunHeader } from '../kun/Header'
import { NsfwVisibilityHint } from '../kun/NsfwVisibilityHint'
import { KunPagination } from '../kun/Pagination'
import type { SortField, SortOrder } from './_sort'
import {
  DEFAULT_GALGAME_SORT_FIELD,
  DEFAULT_GALGAME_SORT_ORDER,
  parsePositiveIntParam
} from '~/utils/galgameFilter'

interface Props {
  initialGalgames: GalgameCard[]
  initialTotal: number
  initialNsfwHiddenCount?: number
  initialPage: number
  initialSortField: SortField
  initialSortOrder: SortOrder
}

export const CardContainer = ({
  initialGalgames,
  initialTotal,
  initialNsfwHiddenCount = 0,
  initialPage,
  initialSortField,
  initialSortOrder
}: Props) => {
  const isMounted = useMounted()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [galgames, setGalgames] = useState<GalgameCard[]>(initialGalgames)
  const [total, setTotal] = useState(initialTotal)
  const [nsfwHiddenCount, setNsfwHiddenCount] = useState(initialNsfwHiddenCount)
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<SortField>(initialSortField)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder)
  const [page, setPage] = useState(initialPage)

  const withPageReset = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setPage(1)
      setter(value)
    }
  }

  const fetchPatches = async () => {
    setLoading(true)

    const { galgames, total, nsfwHiddenCount } = await kunFetchGet<{
      galgames: GalgameCard[]
      total: number
      nsfwHiddenCount: number
    }>('/galgame', {
      sortField,
      sortOrder,
      page,
      limit: 24
    })

    setGalgames(galgames)
    setTotal(total)
    setNsfwHiddenCount(nsfwHiddenCount)
    setLoading(false)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }
    void fetchPatches()
  }, [isMounted, sortField, sortOrder, page])

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

  useEffect(() => {
    const nextPage = parsePositiveIntParam(searchParams.get('page'), initialPage)
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

  return (
    <div className="container mx-auto my-4 space-y-6">
      <KunHeader
        name="游戏列表"
        description="这里收录了站内全部游戏文章，可查看介绍、标签与资源。"
      />

      <NsfwVisibilityHint count={nsfwHiddenCount} />

      <FilterBar
        sortField={sortField}
        setSortField={withPageReset(setSortField)}
        sortOrder={sortOrder}
        setSortOrder={withPageReset(setSortOrder)}
      />

      <div className="mx-auto mb-8 grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {galgames.map((pa) => (
          <GalgameCard key={pa.id} patch={pa} />
        ))}
      </div>

      {total > 24 && (
        <div className="flex justify-center">
          <KunPagination
            total={Math.ceil(total / 24)}
            page={page}
            onPageChange={setPage}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}
