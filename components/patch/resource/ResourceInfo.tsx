'use client'

import { Chip } from '@heroui/react'
import { Link as LinkIcon, MessageSquareText } from 'lucide-react'
import { SUPPORTED_RESOURCE_LINK_MAP } from '~/constants/resource'
import type { PatchResource } from '~/types/api/patch'

interface Props {
  resource: PatchResource
}

export const ResourceInfo = ({ resource }: Props) => {
  return (
    <div className="space-y-2">
      {resource.name ? (
        <h3 className="text-base font-semibold text-default-800">
          {resource.name}
        </h3>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Chip
          color="secondary"
          variant="flat"
          startContent={<LinkIcon className="size-4" />}
        >
          {SUPPORTED_RESOURCE_LINK_MAP[resource.storage] ?? resource.storage}
        </Chip>
        <Chip
          variant="flat"
          startContent={<MessageSquareText className="size-4" />}
        >
          {resource.section === 'direct' ? '直链资源' : '网盘资源'}
        </Chip>
      </div>
    </div>
  )
}
