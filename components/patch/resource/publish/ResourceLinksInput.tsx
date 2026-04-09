'use client'

import { Chip } from '@heroui/chip'
import { Input, Textarea } from '@heroui/react'
import { SUPPORTED_RESOURCE_LINK_MAP } from '~/constants/resource'
import type { ErrorType } from '../share'

interface ResourceLinksInputProps {
  errors: ErrorType
  section: string
  storage: string
  content: string
  setContent: (value: string) => void
}

export const ResourceLinksInput = ({
  errors,
  section,
  storage,
  content,
  setContent
}: ResourceLinksInputProps) => {
  const isDirect = section === 'direct'

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">下载链接</h3>
        <Chip color="primary" variant="flat">
          {SUPPORTED_RESOURCE_LINK_MAP[storage] ?? storage}
        </Chip>
      </div>

      {isDirect ? (
        <Textarea
          isRequired
          minRows={5}
          label="直链链接"
          placeholder={'每行填写一个直链链接\n如果直接换行填写多个链接，会一次性拆分为多条直链资源'}
          value={content}
          isInvalid={!!errors.content}
          errorMessage={errors.content?.message}
          onChange={(event) => setContent(event.target.value)}
        />
      ) : (
        <Input
          isRequired
          label="资源链接"
          placeholder="填写网盘分享链接"
          value={content}
          isInvalid={!!errors.content}
          errorMessage={errors.content?.message}
          onChange={(event) => setContent(event.target.value)}
        />
      )}
    </div>
  )
}
