'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal } from '@heroui/modal'
import { Button } from '@heroui/button'
import { Plus } from 'lucide-react'
import Masonry from 'react-masonry-css'
import { kunFetchGet } from '~/utils/kunFetch'
import { KunNull } from '~/components/kun/Null'
import { RatingCard } from './RatingCard'
import { RatingCardSkeleton } from './RatingCardSkeleton'
import { RatingModal } from './RatingModal'
import { useDisclosure } from '@heroui/react'
import { useUserStore } from '~/store/userStore'
import type {
  KunPatchRating,
  KunPatchRatingResponse
} from '~/types/api/galgame'

interface Props {
  id: number
}

const RATINGS_PER_PAGE = 24

export const Ratings = ({ id }: Props) => {
  const [ratings, setRatings] = useState<KunPatchRating[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const user = useUserStore((state) => state.user)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)

  const fetchRatings = useCallback(
    async (pageNum: number, reset = false) => {
      if (isFetchingRef.current) return

      isFetchingRef.current = true
      setLoading(true)
      setLoadError(false)

      try {
        const res = await kunFetchGet<KunPatchRatingResponse>('/patch/rating', {
          patchId: Number(id),
          page: pageNum,
          limit: RATINGS_PER_PAGE
        })

        if (res && typeof res !== 'string') {
          if (reset) {
            setRatings(res.ratings)
          } else {
            setRatings((prev) => [...prev, ...res.ratings])
          }
          setTotal(res.total)
          setHasMore(res.ratings.length === RATINGS_PER_PAGE)
          return
        }

        setLoadError(true)
        if (reset) {
          setRatings([])
          setTotal(0)
        }
        setHasMore(false)
      } catch {
        setLoadError(true)
        if (reset) {
          setRatings([])
          setTotal(0)
        }
        setHasMore(false)
      } finally {
        isFetchingRef.current = false
        setLoading(false)
      }
    },
    [id]
  )

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setLoadError(false)
    void fetchRatings(1, true)
  }, [fetchRatings, id])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading || loadError) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [hasMore, loadError, loading])

  useEffect(() => {
    if (page > 1) {
      void fetchRatings(page)
    }
  }, [fetchRatings, page])

  const handleCreated = (rating?: KunPatchRating) => {
    if (rating) {
      setRatings((prev) => [rating, ...prev])
      setTotal((prev) => prev + 1)
    }
  }

  const handlePatchUpdated = (rating: KunPatchRating) => {
    setRatings((prev) => prev.map((r) => (r.id === rating.id ? rating : r)))
  }

  const handleDeleted = (ratingId: number) => {
    setRatings((prev) => prev.filter((r) => r.id !== ratingId))
    setTotal((prev) => prev - 1)
  }

  const breakpointColumns = {
    default: 3,
    1024: 2,
    640: 1
  }

  return (
    <div className="space-y-4">
      {user.uid ? (
        <div className="flex justify-end">
          <Button
            color="primary"
            variant="flat"
            startContent={<Plus className="size-4" />}
            onPress={onOpen}
          >
            发布评分
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-large border border-divider bg-content1/60 px-4 py-3">
          <p className="text-sm text-default-600">
            游客可以直接浏览评分与简评，登录后即可参与评分。
          </p>
          <Button
            as={Link}
            href="/login"
            color="primary"
            variant="flat"
            startContent={<Plus className="size-4" />}
          >
            登录后发布评分
          </Button>
        </div>
      )}

      <Masonry
        breakpointCols={breakpointColumns}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {ratings.map((rating) => (
          <div key={rating.id} className="mb-4">
            <RatingCard
              rating={rating}
              patchId={id}
              onRatingUpdated={handlePatchUpdated}
              onDeleted={handleDeleted}
            />
          </div>
        ))}
      </Masonry>

      {loading ? (
        <Masonry
          breakpointCols={breakpointColumns}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="mb-4">
              <RatingCardSkeleton />
            </div>
          ))}
        </Masonry>
      ) : null}

      <div ref={loadMoreRef} className="h-4 w-full" />

      {loadError && !ratings.length && !loading ? (
        <KunNull message="评分加载失败，请稍后重试" />
      ) : null}

      {!loadError && !ratings.length && !loading ? (
        <KunNull message="这个游戏还没有评分" />
      ) : null}

      {!hasMore && ratings.length > 0 ? (
        <p className="text-center text-sm text-default-500">
          已加载全部 {total} 条评分
        </p>
      ) : null}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <RatingModal
          isOpen={isOpen}
          onClose={onClose}
          patchId={id}
          onSuccess={handleCreated}
        />
      </Modal>
    </div>
  )
}
