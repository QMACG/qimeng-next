'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Tab, Tabs } from '@heroui/react'
import { PublishedMarkdownPreview } from './PublishedMarkdownPreview'
import { KunEditor } from '~/components/kun/milkdown/Editor'

interface Props {
  value: string
  onChange: (value: string) => void
  editorTitle?: string
  previewTitle?: string
  placeholder?: string
  minRows?: number
  layout?: 'split' | 'tabs'
}

export const MarkdownEditor = ({
  value,
  onChange,
  editorTitle = 'Markdown 原文编辑',
  previewTitle = '发布预览',
  placeholder = '请输入 Markdown 正文内容',
  minRows = 18
}: Props) => {
  const [selectedTab, setSelectedTab] = useState<'editor' | 'preview'>('editor')
  const minHeightRem = Math.max(Number((minRows * 1.55).toFixed(1)), 18)

  return (
    <Card className="border border-default-200">
      <CardHeader className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-medium">{editorTitle}</h3>
      </CardHeader>
      <CardBody className="pt-0">
        <Tabs
          aria-label="正文编辑与发布预览"
          selectedKey={selectedTab}
          onSelectionChange={(key) =>
            setSelectedTab((key as 'editor' | 'preview') ?? 'editor')
          }
          variant="underlined"
          color="primary"
        >
          <Tab key="editor" title={editorTitle}>
            <div className="pt-4">
              <KunEditor
                valueMarkdown={value}
                saveMarkdown={onChange}
                placeholder={placeholder}
                minHeight={`${minHeightRem}rem`}
              />
            </div>
          </Tab>

          <Tab key="preview" title={previewTitle}>
            <div className="pt-4">
              <PublishedMarkdownPreview
                markdown={value}
                embedded
                emptyHint="输入内容后，这里会显示接近正式发布页的渲染效果。"
              />
            </div>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  )
}
