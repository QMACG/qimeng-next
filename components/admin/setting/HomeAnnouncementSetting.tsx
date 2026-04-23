'use client'

import { useState } from 'react'
import { Button, Input, Switch } from '@heroui/react'
import toast from 'react-hot-toast'
import { MarkdownEditor } from '~/components/kun/markdown/MarkdownEditor'
import type { AdminHomeAnnouncementConfig } from '~/types/api/admin'
import { kunFetchPut } from '~/utils/kunFetch'

interface Props {
  setting: AdminHomeAnnouncementConfig
}

export const HomeAnnouncementSetting = ({ setting }: Props) => {
  const [isEnabled, setIsEnabled] = useState(setting.isEnabled)
  const [title, setTitle] = useState(setting.title)
  const [content, setContent] = useState(setting.content)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await kunFetchPut<
        KunResponse<AdminHomeAnnouncementConfig>
      >('/admin/setting/home-announcement', {
        isEnabled,
        title,
        content
      })

      if (typeof response === 'string') {
        toast.error(response)
      } else {
        setTitle(response.title)
        setContent(response.content)
        setIsEnabled(response.isEnabled)
        toast.success('首页公告已保存')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存首页公告失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-large border border-divider p-4">
        <div>
          <h3 className="text-lg font-medium">启用首页公告弹窗</h3>
          <p className="text-sm text-default-500">
            开启后，首页会使用弹窗展示公告内容，同一位访客每天只会看到一次。
          </p>
        </div>

        <Switch
          color="primary"
          isSelected={isEnabled}
          onValueChange={setIsEnabled}
        />
      </div>

      <Input
        label="公告标题"
        labelPlacement="outside"
        placeholder="例如：站点公告"
        value={title}
        onValueChange={setTitle}
      />

      <MarkdownEditor
        value={content}
        onChange={setContent}
        editorTitle="公告正文"
        previewTitle="弹窗预览"
        placeholder="支持 Markdown。这里填写首页弹窗公告内容。"
        minRows={14}
        layout="tabs"
      />

      <div className="flex justify-end">
        <Button
          color="primary"
          onPress={handleSave}
          isLoading={saving}
          isDisabled={saving}
        >
          保存公告
        </Button>
      </div>
    </div>
  )
}
