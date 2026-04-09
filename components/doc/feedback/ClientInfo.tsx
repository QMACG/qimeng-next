'use client'

import { Chip } from '@heroui/chip'
import { Globe, Monitor } from 'lucide-react'
import type { DocCommentClientInfo } from '~/types/api/doc'

interface Props {
  clientInfo: DocCommentClientInfo
}

export const FeedbackClientInfo = ({ clientInfo }: Props) => {
  return (
    <div className="mb-1 flex flex-wrap items-center gap-2">
      <Chip
        size="sm"
        variant="flat"
        startContent={<Monitor className="size-3" />}
      >
        {clientInfo.os}
      </Chip>
      <Chip
        size="sm"
        variant="flat"
        startContent={<Globe className="size-3" />}
      >
        {clientInfo.browser}
      </Chip>
    </div>
  )
}
