'use client'

import { Tooltip } from '@heroui/tooltip'
import { Download, Eye, Heart, MessageSquare, Puzzle } from 'lucide-react'
import { useUserStore } from '~/store/userStore'
import { cn } from '~/utils/cn'
import { formatNumber } from '~/utils/formatNumber'

interface Props {
  patch: GalgameCard
  disableTooltip?: boolean
  className?: string
  isMobile?: boolean
}

export const KunCardStats = ({
  patch,
  disableTooltip = true,
  isMobile = false
}: Props) => {
  const role = useUserStore((state) => state.user.role)
  const showViewCount = patch.showViewCount ?? role >= 2
  const showDownloadCount = patch.showDownloadCount ?? role >= 2

  return (
    <div
      className={cn(
        'flex justify-between space-x-2 text-sm text-default-500 sm:space-x-4',
        isMobile ? 'sm:justify-start' : ''
      )}
    >
      {showViewCount ? (
        <Tooltip isDisabled={disableTooltip} content="浏览数" placement="bottom">
          <div className="flex items-center gap-1">
            <Eye className="size-4" />
            <span>{formatNumber(patch.view)}</span>
          </div>
        </Tooltip>
      ) : null}

      {showDownloadCount ? (
        <Tooltip isDisabled={disableTooltip} content="下载数" placement="bottom">
          <div className="flex items-center gap-1">
            <Download className="size-4" />
            <span>{formatNumber(patch.download)}</span>
          </div>
        </Tooltip>
      ) : null}

      <Tooltip isDisabled={disableTooltip} content="收藏数" placement="bottom">
        <div className="flex items-center gap-1">
          <Heart className="size-4" />
          <span>{formatNumber(patch._count.favorite_folder || 0)}</span>
        </div>
      </Tooltip>

      {!isMobile ? (
        <Tooltip isDisabled={disableTooltip} content="资源数" placement="bottom">
          <div className="flex items-center gap-1">
            <Puzzle className="size-4" />
            <span>{formatNumber(patch._count.resource || 0)}</span>
          </div>
        </Tooltip>
      ) : null}

      <Tooltip isDisabled={disableTooltip} content="评论数" placement="bottom">
        <div
          className={cn('flex items-center gap-1', isMobile && 'hidden sm:flex')}
        >
          <MessageSquare className="size-4" />
          <span>{formatNumber(patch._count.comment || 0)}</span>
        </div>
      </Tooltip>
    </div>
  )
}
