'use client'

import { useEffect, useState } from 'react'
import { kunFetchGet } from '~/utils/kunFetch'
import { CommentCard } from './CommentCard'
import { FilterBar } from './FilterBar'
import { useMounted } from '~/hooks/useMounted'
import { useSyncedCommentListQuery } from '~/hooks/useSyncedCommentListQuery'
import { KunLoading } from '~/components/kun/Loading'
import { KunHeader } from '../kun/Header'
import { KunPagination } from '~/components/kun/Pagination'
import { KunNull } from '~/components/kun/Null'
import type { SortDirection, SortOption } from './_sort'
import type { PatchComment } from '~/types/api/comment'

const DEFAULT_SORT_FIELD: SortOption = 'created'
const DEFAULT_SORT_ORDER: SortDirection = 'desc'

interface Props {
  initialComments: PatchComment[]
  initialTotal: number
  initialPage: number
  initialSortField: SortOption
  initialSortOrder: SortDirection
  uid?: number
}

export const CardContainer = ({
  initialComments,
  initialTotal,
  initialPage,
  initialSortField,
  initialSortOrder,
  uid
}: Props) => {
  const {
    page,
    setPage,
    sortField,
    sortOrder,
    setSortFieldWithPageReset,
    setSortOrderWithPageReset
  } = useSyncedCommentListQuery({
    initialPage,
    initialSortField,
    initialSortOrder,
    defaultSortField: DEFAULT_SORT_FIELD,
    defaultSortOrder: DEFAULT_SORT_ORDER
  })

  const [comments, setComments] = useState<PatchComment[]>(initialComments)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const isMounted = useMounted()

  const fetchData = async () => {
    setLoading(true)

    const { comments, total: nextTotal } = await kunFetchGet<{
      comments: PatchComment[]
      total: number
    }>('/comment', {
      sortField,
      sortOrder,
      page,
      limit: 50
    })

    setComments(comments)
    setTotal(nextTotal)
    setLoading(false)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }
    void fetchData()
  }, [sortField, sortOrder, page, isMounted])

  return (
    <div className="container mx-auto my-4 space-y-6">
      <KunHeader
        name="游戏评论"
        description="这里展示站内最新的游戏评论与讨论"
      />

      {uid ? (
        <>
          <FilterBar
            sortField={sortField}
            setSortField={setSortFieldWithPageReset}
            sortOrder={sortOrder}
            setSortOrder={setSortOrderWithPageReset}
          />

          {loading ? (
            <KunLoading hint="正在获取评论数据..." />
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}

          {total > 50 && (
            <div className="flex justify-center">
              <KunPagination
                total={Math.ceil(total / 50)}
                page={page}
                onPageChange={setPage}
                isLoading={loading}
              />
            </div>
          )}
        </>
      ) : (
        <KunNull message="请登录后查看评论内容" />
      )}
    </div>
  )
}
