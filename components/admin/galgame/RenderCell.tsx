'use client'

import { Button, Chip } from '@heroui/react'
import { Image } from '@heroui/image'
import Link from 'next/link'
import { ExternalLink, PencilLine } from 'lucide-react'
import { formatTimeDifference } from '~/utils/time'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import {
  CONTENT_VISIBILITY_COLOR_MAP,
  CONTENT_VISIBILITY_LABEL_MAP
} from '~/constants/contentVisibility'
import type { AdminGalgame } from '~/types/api/admin'

export const RenderCell = (galgame: AdminGalgame, columnKey: string) => {
  switch (columnKey) {
    case 'id':
      return (
        <Chip size="sm" variant="flat" color="default">
          {galgame.id}
        </Chip>
      )
    case 'banner':
      return (
        <Image
          alt={galgame.name}
          className="object-cover"
          width={128}
          src={galgame.banner || '/favicon.ico'}
          style={{ aspectRatio: '16/9' }}
        />
      )
    case 'name':
      return (
        <Link
          href={`/admin/galgame/${galgame.uniqueId}`}
          className="font-medium hover:text-primary-500"
        >
          {galgame.name}
        </Link>
      )
    case 'status':
      return (
        <Chip
          size="sm"
          variant="flat"
          color={CONTENT_VISIBILITY_COLOR_MAP[galgame.status] ?? 'default'}
        >
          {CONTENT_VISIBILITY_LABEL_MAP[galgame.status] ?? '未知'}
        </Chip>
      )
    case 'user':
      return (
        <KunUser
          user={galgame.user}
          userProps={{
            name: galgame.user.name,
            avatarProps: {
              src: galgame.user.avatar
            }
          }}
        />
      )
    case 'created':
      return (
        <Chip size="sm" variant="light">
          {formatTimeDifference(galgame.created)}
        </Chip>
      )
    case 'actions':
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            as={Link}
            href={`/admin/galgame/${galgame.uniqueId}`}
            size="sm"
            variant="flat"
            color="primary"
            startContent={<PencilLine className="size-4" />}
          >
            编辑
          </Button>
          <Button
            as={Link}
            href={`/${galgame.uniqueId}`}
            target="_blank"
            size="sm"
            variant="light"
            startContent={<ExternalLink className="size-4" />}
          >
            前台查看
          </Button>
        </div>
      )
    default:
      return null
  }
}
