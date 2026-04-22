'use client'

import { useEffect, useState } from 'react'
import { KunHeader } from '~/components/kun/Header'
import { KunPagination } from '~/components/kun/Pagination'
import { RankingControls } from './RankingControls'
import { RankingList } from './RankingList'
import { useMounted } from '~/hooks/useMounted'
import { useSyncedRankingListQuery } from '~/hooks/useSyncedRankingListQuery'
import { kunFetchGet } from '~/utils/kunFetch'
import type { RankingCard, RankingSortField } from '~/types/api/ranking'

type SortOrder = 'asc' | 'desc'

interface Props {
  initialGalgames: RankingCard[]
  initialTotal: number
  initialPage: number
  initialSortField: RankingSortField
  initialSortOrder: SortOrder
  initialMinRatingCount: number
  defaultSortField: RankingSortField
  defaultSortOrder: SortOrder
  defaultMinRatingCount: number
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 48

export const RankingContainer = ({
  initialGalgames,
  initialTotal,
  initialPage,
  initialSortField,
  initialSortOrder,
  initialMinRatingCount,
  defaultSortField,
  defaultSortOrder,
  defaultMinRatingCount,
  pageSize = DEFAULT_PAGE_SIZE
}: Props) => {
  const isMounted = useMounted()
  const {
    page,
    setPage,
    sortField,
    sortOrder,
    minRatingCount,
    setSortFieldWithPageReset,
    setSortOrderWithPageReset,
    setMinRatingCountWithPageReset
  } = useSyncedRankingListQuery({
    initialPage,
    initialSortField,
    initialSortOrder,
    initialMinRatingCount,
    defaultSortField,
    defaultSortOrder,
    defaultMinRatingCount
  })

  const [galgames, setGalgames] = useState<RankingCard[]>(initialGalgames)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)

  const fetchRanking = async () => {
    setLoading(true)

    const res = await kunFetchGet<{
      galgames: RankingCard[]
      total: number
    }>('/ranking', {
      sortField,
      sortOrder,
      minRatingCount,
      page,
      limit: pageSize
    })
    setGalgames(res.galgames)
    setTotal(res.total)

    setLoading(false)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }
    void fetchRanking()
  }, [isMounted, page, sortField, sortOrder, minRatingCount])

  return (
    <div className="container mx-auto my-4 space-y-6">
      <KunHeader
        name="游戏排行榜"
        description="根据评分、收藏、评论与资源热度整理的排行榜，方便快速挑选想玩的作品"
      />

      <RankingControls
        sortField={sortField}
        sortOrder={sortOrder}
        minRatingCount={minRatingCount}
        isLoading={loading}
        onSortFieldChange={setSortFieldWithPageReset}
        onSortOrderChange={setSortOrderWithPageReset}
        onMinRatingCountChange={setMinRatingCountWithPageReset}
      />

      <RankingList galgames={galgames} page={page} pageSize={pageSize} />

      {total > pageSize && (
        <div className="flex justify-center">
          <KunPagination
            total={Math.ceil(total / pageSize)}
            page={page}
            onPageChange={setPage}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}
