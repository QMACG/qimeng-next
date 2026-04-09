'use client'

import { Chip } from '@heroui/chip'
import { Link as LinkIcon } from 'lucide-react'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { SUPPORTED_RESOURCE_LINK_MAP } from '~/constants/resource'
import { kunFetchPut } from '~/utils/kunFetch'
import type { PatchResource } from '~/types/api/patch'

interface Props {
  resource: PatchResource
}

export const ResourceDownloadCard = ({ resource }: Props) => {
  const handleClickDownload = async () => {
    if (resource.section === 'direct' || resource.storage === 'direct') {
      return
    }

    await kunFetchPut<KunResponse<{}>>('/patch/resource/download', {
      patchId: resource.patchId,
      resourceId: resource.id
    })
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Chip
          color="secondary"
          variant="flat"
          startContent={<LinkIcon className="size-4" />}
        >
          {SUPPORTED_RESOURCE_LINK_MAP[resource.storage] ?? resource.storage}
        </Chip>
      </div>

      <p className="text-sm text-default-500">点击下方链接即可前往对应资源。</p>

      <KunExternalLink
        onPress={handleClickDownload}
        underline="always"
        link={resource.content}
        target="_blank"
        rel="noopener noreferrer"
      >
        {resource.name || resource.content}
      </KunExternalLink>

      {resource.name ? (
        <p className="break-all text-xs text-default-400">{resource.content}</p>
      ) : null}
    </div>
  )
}
