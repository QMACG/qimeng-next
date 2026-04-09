'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button, Tooltip } from '@heroui/react'
import { Download, PencilLine, Share2 } from 'lucide-react'
import { useUserStore } from '~/store/userStore'
import { kunCopy } from '~/utils/kunCopy'
import { FavoriteButton } from './button/favorite/FavoriteButton'
import { RatingButton } from './button/rating/RatingButton'
import { FeedbackButton } from './button/FeedbackButton'
import type { Patch } from '~/types/api/patch'

interface PatchHeaderActionsProps {
  patch: Patch
  handleClickDownloadNav: () => void
}

export const PatchHeaderActions = ({
  patch,
  handleClickDownloadNav
}: PatchHeaderActionsProps) => {
  const [sharing, setSharing] = useState(false)
  const role = useUserStore((state) => state.user.role)
  const canEdit = role >= 2

  const handleShareLink = async () => {
    setSharing(true)
    const origin = window.location.origin
    await kunCopy(`${patch.name} - ${origin}/${patch.uniqueId}`)
    setSharing(false)
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap gap-2">
        <Tooltip content="查看下载资源">
          <Button
            color="primary"
            variant="shadow"
            startContent={<Download className="size-4" />}
            onPress={handleClickDownloadNav}
            size="sm"
          >
            下载
          </Button>
        </Tooltip>

        <RatingButton patchId={patch.id} />
        <FavoriteButton patchId={patch.id} isFavorite={patch.isFavorite} />

        <Tooltip content="复制分享链接">
          <Button
            variant="bordered"
            isIconOnly
            size="sm"
            onPress={handleShareLink}
            isLoading={sharing}
            aria-label="复制分享链接"
          >
            <Share2 className="size-4" />
          </Button>
        </Tooltip>

        <FeedbackButton patch={patch} />

        {canEdit ? (
          <Tooltip content="编辑游戏">
            <Button
              as={Link}
              href={`/admin/galgame/${patch.uniqueId}`}
              color="secondary"
              variant="flat"
              size="sm"
              startContent={<PencilLine className="size-4" />}
            >
              编辑
            </Button>
          </Tooltip>
        ) : null}
      </div>

      <p className="text-xs text-default-500">
        收藏后若有资源更新，你会收到站内通知
      </p>
    </div>
  )
}
