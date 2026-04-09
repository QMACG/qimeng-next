'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'
import { Download } from 'lucide-react'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { formatTimeDifference } from '~/utils/time'
import type { PatchResource } from '~/types/api/patch'
import { ResourceDownloadCard } from './DownloadCard'
import { ResourceLikeButton } from './ResourceLike'

interface Props {
  resource: PatchResource
}

export const ResourceDownload = ({ resource }: Props) => {
  const [showLinks, setShowLinks] = useState<Record<number, boolean>>({})
  const description = resource.user.showContributionStats
    ? `${formatTimeDifference(resource.created)} 发布 · 共维护 ${resource.user.patchCount} 条资源`
    : `${formatTimeDifference(resource.created)} 发布`

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <KunUser
          user={resource.user}
          userProps={{
            name: resource.user.name,
            description,
            avatarProps: {
              showFallback: true,
              src: resource.user.avatar,
              name: resource.user.name.charAt(0).toUpperCase()
            }
          }}
        />

        <div className="flex gap-2">
          <ResourceLikeButton resource={resource} />
          <Button
            color="primary"
            isIconOnly
            aria-label="展开下载资源"
            onPress={() =>
              setShowLinks((prev) => ({
                ...prev,
                [resource.id]: !prev[resource.id]
              }))
            }
          >
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      {showLinks[resource.id] && <ResourceDownloadCard resource={resource} />}
    </div>
  )
}
