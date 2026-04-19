'use client'

import Link from 'next/link'
import { Card } from '@heroui/react'
import { formatNumber } from '~/utils/formatNumber'
import { KunCardStats } from '~/components/kun/CardStats'
import { cn } from '~/utils/cn'
import type { CSSProperties } from 'react'
import type { RankingCard } from '~/types/api/ranking'

interface Props {
  galgames: RankingCard[]
  page: number
  pageSize: number
}

const blurredCoverImageStyle: CSSProperties = {
  filter: 'blur(8px) saturate(1.02) brightness(0.99)',
  transform: 'scale(1.08)'
}

const frostedOverlayStyle: CSSProperties = {
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  background: 'rgba(255, 255, 255, 0.03)'
}

export const RankingList = ({ galgames, page, pageSize }: Props) => {
  const startRank = (page - 1) * pageSize

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {galgames.map((patch, index) => {
          const rank = startRank + index + 1
          const rating =
            patch.averageRating && patch.averageRating > 0
              ? patch.averageRating.toFixed(1)
              : '--'
          const coverSrc = patch.banner || '/favicon.ico'

          return (
            <Card
              key={patch.id}
              as={Link}
              isPressable
              href={`/${patch.uniqueId}`}
            >
              <div className="relative w-full overflow-hidden">
                <div className="relative aspect-video bg-default-100">
                  {patch.shouldBlurForGuest ? (
                    <>
                      <img
                        src={coverSrc}
                        alt={patch.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-55"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <img
                        src={coverSrc}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={blurredCoverImageStyle}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <div
                        className="absolute inset-0 z-[1] dark:bg-black/10"
                        style={frostedOverlayStyle}
                      />
                      <div className="absolute inset-0 z-[2] bg-gradient-to-br from-white/4 via-transparent to-black/3" />
                    </>
                  ) : (
                    <>
                      <img
                        src={coverSrc}
                        alt={patch.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                    </>
                  )}
                </div>

                <div
                  className={cn(
                    'absolute left-3 top-3 flex aspect-square items-center rounded-lg bg-background/80 px-2',
                    rank > 99 ? 'text-xs' : rank > 9 ? 'text-sm' : 'text-base'
                  )}
                >
                  {rank}
                </div>

                <div className="absolute right-3 top-3 text-right text-xs text-white">
                  <p className="text-lg font-bold text-warning-500">{rating}</p>
                  <p className="opacity-80">
                    {formatNumber(patch.ratingCount)} 人评分
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
                <div className="space-y-1">
                  <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                    {patch.name}
                  </h3>
                  <p className="line-clamp-1 text-xs text-default-500">
                    {patch.tags.length ? patch.tags.join(' / ') : '暂无标签'}
                  </p>
                </div>

                <KunCardStats patch={patch} disableTooltip isMobile />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
