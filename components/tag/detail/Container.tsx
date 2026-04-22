'use client'

import { useEffect, useState } from 'react'
import { Chip } from '@heroui/chip'
import { kunFetchGet } from '~/utils/kunFetch'
import { GalgameCard } from '~/components/galgame/Card'
import { FilterBar } from '~/components/galgame/FilterBar'
import { KunHeader } from '~/components/kun/Header'
import { KunLoading } from '~/components/kun/Loading'
import { KunNull } from '~/components/kun/Null'
import { KunPagination } from '~/components/kun/Pagination'
import { NsfwVisibilityHint } from '~/components/kun/NsfwVisibilityHint'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { useMounted } from '~/hooks/useMounted'
import { useSyncedGalgameListQuery } from '~/hooks/useSyncedGalgameListQuery'
import { errorReporter, kunErrorHandler } from '~/utils/kunErrorHandler'
import { formatTimeDifference } from '~/utils/time'
import type { SortField, SortOrder } from '~/components/galgame/_sort'
import type { TagDetail } from '~/types/api/tag'

interface Props {
  initialTag: TagDetail
  initialPatches: GalgameCard[]
  total: number
  initialNsfwHiddenCount: number
  initialPage: number
  initialSortField: SortField
  initialSortOrder: SortOrder
}

export const TagDetailContainer = ({
  initialTag,
  initialPatches,
  total,
  initialNsfwHiddenCount,
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

  const [tag] = useState(initialTag)
  const [patches, setPatches] = useState<GalgameCard[]>(initialPatches)
  const [totalCount, setTotalCount] = useState(total)
  const [nsfwHiddenCount, setNsfwHiddenCount] = useState(initialNsfwHiddenCount)
  const [loading, setLoading] = useState(false)

  const fetchPatches = async () => {
    setLoading(true)

    try {
      const response = await kunFetchGet<
        | {
            galgames: GalgameCard[]
            total: number
            nsfwHiddenCount: number
          }
        | string
      >('/tag/galgame', {
        tagId: tag.id,
        page,
        limit: 24,
        sortField,
        sortOrder
      })

      if (typeof response === 'string') {
        kunErrorHandler(response, () => {})
        setPatches([])
        setTotalCount(0)
        setNsfwHiddenCount(0)
        return
      }

      setPatches(response.galgames)
      setTotalCount(response.total)
      setNsfwHiddenCount(response.nsfwHiddenCount)
    } catch (error) {
      setPatches([])
      setTotalCount(0)
      setNsfwHiddenCount(0)
      errorReporter(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    void fetchPatches()
  }, [isMounted, page, sortField, sortOrder])

  return (
    <div className="my-4 w-full space-y-6">
      <KunHeader
        name={tag.name}
        description={tag.introduction}
        headerEndContent={
          <Chip size="lg" color="primary">
            {tag.count} 部作品
          </Chip>
        }
        endContent={
          <div className="flex justify-between">
            <KunUser
              user={tag.user}
              userProps={{
                name: tag.user.name,
                description: `创建于 ${formatTimeDifference(tag.created)}`,
                avatarProps: {
                  src: tag.user?.avatar
                }
              }}
            />
          </div>
        }
      />

      <FilterBar
        sortField={sortField}
        setSortField={setSortFieldWithPageReset}
        sortOrder={sortOrder}
        setSortOrder={setSortOrderWithPageReset}
      />

      {tag.alias.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">别名</h2>
          <div className="flex flex-wrap gap-2">
            {tag.alias.map((alias, index) => (
              <Chip key={index} variant="flat" color="secondary">
                {alias}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <KunLoading hint="正在加载作品..." />
      ) : (
        <div className="space-y-4">
          <NsfwVisibilityHint count={nsfwHiddenCount} />

          <div className="mx-auto grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {patches.map((pa) => (
              <GalgameCard key={pa.id} patch={pa} />
            ))}
          </div>

          {totalCount > 24 && (
            <div className="flex justify-center">
              <KunPagination
                total={Math.ceil(totalCount / 24)}
                page={page}
                onPageChange={setPage}
                isLoading={loading}
              />
            </div>
          )}

          {!totalCount && nsfwHiddenCount <= 0 && (
            <KunNull message="这个标签下暂时还没有作品" />
          )}
        </div>
      )}
    </div>
  )
}
