'use client'

import { KunHeader } from '../kun/Header'
import type { Tag as TagType } from '~/types/api/tag'

interface Props {
  setNewTag: (tag: TagType) => void
}

export const TagHeader = ({ setNewTag: _setNewTag }: Props) => {
  return <KunHeader name="标签列表" description="这里汇总站内游戏标签。" />
}
