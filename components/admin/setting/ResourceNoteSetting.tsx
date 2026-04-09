'use client'

import { useState } from 'react'
import { Button, Switch } from '@heroui/react'
import toast from 'react-hot-toast'
import { MarkdownEditor } from '~/components/kun/markdown/MarkdownEditor'
import { kunFetchPut } from '~/utils/kunFetch'
import type { AdminResourceNoteConfig } from '~/types/api/admin'

interface Props {
  setting: AdminResourceNoteConfig
}

export const ResourceNoteSetting = ({ setting }: Props) => {
  const [enableNote, setEnableNote] = useState(setting.enableNote)
  const [defaultNote, setDefaultNote] = useState(setting.defaultNote)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    const response = await kunFetchPut<KunResponse<{}>>(
      '/admin/setting/resource-note',
      {
        enableNote,
        defaultNote
      }
    )

    if (typeof response === 'string') {
      toast.error(response)
    } else {
      toast.success('资源备注设置已保存')
    }

    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-large border border-divider p-4">
        <div>
          <h3 className="text-lg font-medium">启用资源备注</h3>
          <p className="text-sm text-default-500">
            关闭后，前台游戏资源区域将不再显示备注内容。
          </p>
        </div>

        <Switch
          isSelected={enableNote}
          onValueChange={setEnableNote}
          color="primary"
        />
      </div>

      <MarkdownEditor
        value={defaultNote}
        onChange={setDefaultNote}
        editorTitle="默认资源备注"
        previewTitle="前台显示预览"
        placeholder="这里填写默认资源备注。若某个游戏没有单独设置资源备注，前台会自动显示这里的内容。"
        minRows={12}
        layout="tabs"
      />

      <div className="flex justify-end">
        <Button
          color="primary"
          onPress={handleSave}
          isLoading={saving}
          isDisabled={saving}
        >
          保存设置
        </Button>
      </div>
    </div>
  )
}
