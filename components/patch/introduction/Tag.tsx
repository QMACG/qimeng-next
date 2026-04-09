'use client'

import { Chip } from '@heroui/chip'
import { Tooltip } from '@heroui/tooltip'
import { Link } from '@heroui/link'
import type { Tag } from '~/types/api/tag'

interface Props {
  patchId: number
  initialTags: Tag[]
}

export const PatchTag = ({ initialTags }: Props) => {
  return (
    <div className="mt-4 space-y-4">
      <h2 className="mt-12 border-t border-default-200 pt-8 text-2xl">
        游戏标签
      </h2>

      <div className="flex flex-wrap gap-2">
        {initialTags.map((tag) => (
          <Tooltip key={tag.id} content={`${tag.count} 个游戏使用该标签`}>
            <Link href={`/tag/${tag.id}`}>
              <Chip color="secondary" variant="flat">
                {tag.name}
                {` +${tag.count}`}
              </Chip>
            </Link>
          </Tooltip>
        ))}

        {!initialTags.length && <Chip>当前游戏暂时没有标签</Chip>}
      </div>
    </div>
  )
}
