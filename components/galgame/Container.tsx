'use client'

import { useEffect, useState } from 'react'
import { kunFetchGet } from '~/utils/kunFetch'
import { GalgameCard as GalgameCardView } from './Card'
import { FilterBar } from './FilterBar'
import { useMounted } from '~/hooks/useMounted'
import { useSyncedGalgameListQuery } from '~/hooks/useSyncedGalgameListQuery'
import { KunHeader } from '../kun/Header'
import { NsfwVisibilityHint } from '../kun/NsfwVisibilityHint'
import { KunPagination } from '../kun/Pagination'
import type { SortField, SortOrder } from './_sort'

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
  const {
    page,
    setPage,
    sortField,
    sortOrder,
    setSortFieldWithPageReset,
    setSortOrderWithPageReset
  } = useSyncedGalgameListQuery({
    initialPage,
    initialSortField,
    initialSortOrder
  })

  const [galgames, setGalgames] = useState(initialGalgames)
  const [total, setTotal] = useState(initialTotal)
  const [nsfwHiddenCount, setNsfwHiddenCount] = useState(initialNsfwHiddenCount)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="container mx-auto my-4 space-y-6">
      <KunHeader
        name="游戏列表"
        description="这里收录了站内全部游戏文章，可查看介绍、标签与资源。"
      />

      <NsfwVisibilityHint count={nsfwHiddenCount} />

      <FilterBar
        sortField={sortField}
        setSortField={setSortFieldWithPageReset}
        sortOrder={sortOrder}
        setSortOrder={setSortOrderWithPageReset}
      />

      <div className="mx-auto mb-8 grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {galgames.map((pa) => (
          <GalgameCardView key={pa.id} patch={pa} />
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
