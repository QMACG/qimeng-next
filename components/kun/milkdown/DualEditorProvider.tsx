'use client'

import { useCallback } from 'react'
import { MarkdownEditor } from '~/components/kun/markdown/MarkdownEditor'
import { useCreatePatchStore } from '~/store/editStore'
import { useRewritePatchStore } from '~/store/rewriteStore'

interface Props {
  storeName: 'patchCreate' | 'patchRewrite'
}

export const KunDualEditorProvider = ({ storeName }: Props) => {
  const getCreatePatchData = useCreatePatchStore((state) => state.getData)
  const setCreatePatchData = useCreatePatchStore((state) => state.setData)
  const getRewritePatchData = useRewritePatchStore((state) => state.getData)
  const setRewritePatchData = useRewritePatchStore((state) => state.setData)

  const getMarkdown = useCallback(() => {
    if (storeName === 'patchCreate') {
      return getCreatePatchData().introduction
    }

    return getRewritePatchData().introduction
  }, [getCreatePatchData, getRewritePatchData, storeName])

  const saveMarkdown = useCallback(
    (markdown: string) => {
      if (storeName === 'patchCreate') {
        setCreatePatchData({ ...getCreatePatchData(), introduction: markdown })
        return
      }

      setRewritePatchData({ ...getRewritePatchData(), introduction: markdown })
    },
    [
      getCreatePatchData,
      getRewritePatchData,
      setCreatePatchData,
      setRewritePatchData,
      storeName
    ]
  )

  return (
    <MarkdownEditor
      value={getMarkdown()}
      onChange={saveMarkdown}
      editorTitle="正文编辑"
      previewTitle="发布预览"
      placeholder="请输入正文内容"
      minRows={22}
    />
  )
}
