'use client'

import { KunDualEditorProvider } from '~/components/kun/milkdown/DualEditorProvider'
import { useCreatePatchStore } from '~/store/editStore'
import { markdownToText } from '~/utils/markdownToText'

interface Props {
  errors: string | undefined
}

export const PatchIntroduction = ({ errors }: Props) => {
  const { data } = useCreatePatchStore()

  return (
    <div className="space-y-2">
      <h2 className="text-xl">游戏介绍</h2>
      {errors && <p className="text-xs text-danger-500">{errors}</p>}

      <KunDualEditorProvider storeName="patchCreate" />

      <p className="text-small text-default-500">
        当前字数：{markdownToText(data.introduction).length}
      </p>
    </div>
  )
}
