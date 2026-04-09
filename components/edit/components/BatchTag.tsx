'use client'

import { useEffect, useState } from 'react'
import { Textarea } from '@heroui/react'
import type { PatchFormDataShape } from '~/components/edit/types'
import {
  normalizeStringArray,
  parseCommaSeparatedStringArray
} from '~/utils/normalizeStringArray'

interface Props {
  data: PatchFormDataShape
  saveTag: (tag: string[]) => void
  errors?: string
}

export const BatchTag = ({ data, saveTag, errors }: Props) => {
  const [manualTagInput, setManualTagInput] = useState(() =>
    normalizeStringArray(data.tag).join(',')
  )

  useEffect(() => {
    const normalizedTags = normalizeStringArray(data.tag)
    const currentInputTags = parseCommaSeparatedStringArray(manualTagInput)

    if (normalizedTags.join(',') !== currentInputTags.join(',')) {
      setManualTagInput(normalizedTags.join(','))
    }
  }, [data.tag, manualTagInput])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl">游戏标签</h2>
        {errors && <p className="text-xs text-danger-500">{errors}</p>}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-default-500">手动填写标签</p>
        <Textarea
          placeholder="批量添加标签，每个标签请用英文逗号(,)或中文逗号(，)分隔"
          value={manualTagInput}
          onChange={(e) => {
            const input = e.target.value
            setManualTagInput(input)
            saveTag(parseCommaSeparatedStringArray(input))
          }}
          className="w-full"
          minRows={3}
        />
        <p className="text-sm text-default-500">
          如果标签不存在，系统会自动创建并更新关联数量。
        </p>
      </div>
    </div>
  )
}
