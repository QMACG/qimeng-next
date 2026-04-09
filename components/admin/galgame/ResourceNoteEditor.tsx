'use client'

import { MarkdownEditor } from '~/components/kun/markdown/MarkdownEditor'

interface Props {
  value: string
  onChange: (value: string) => void
}

export const ResourceNoteEditor = ({ value, onChange }: Props) => {
  return (
    <div className="space-y-2">
      <h2 className="text-xl">资源备注</h2>
      <MarkdownEditor
        value={value}
        onChange={onChange}
        editorTitle="资源备注编辑"
        previewTitle="前台显示预览"
        placeholder="这里填写该游戏的统一资源备注。留空时，前台会自动使用站点默认资源备注。"
        minRows={10}
        layout="tabs"
      />
    </div>
  )
}
