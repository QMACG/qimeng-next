'use client'

import { Card, CardBody, Tab, Tabs } from '@heroui/react'
import { Code, Eye, Mail } from 'lucide-react'

interface Props {
  content: string
  previewOnly?: boolean
}

export const EmailPreview = ({ content, previewOnly = false }: Props) => {
  if (previewOnly) {
    return (
      <iframe
        srcDoc={content}
        style={{ width: '100%', height: '500px', border: 'none' }}
        title="邮件预览"
      />
    )
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center gap-2 text-default-500">
          <Mail className="h-4 w-4" />
          <h3 className="text-sm font-medium">邮件预览</h3>
        </div>

        <Tabs aria-label="邮件预览选项">
          <Tab
            key="preview"
            title={
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>实时预览</span>
              </div>
            }
          >
            <div className="mt-4">
              <iframe
                srcDoc={content}
                style={{ width: '100%', height: '500px', border: 'none' }}
                title="邮件预览"
              />
            </div>
          </Tab>
          <Tab
            key="source"
            title={
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span>源码</span>
              </div>
            }
          >
            <pre className="mt-4 overflow-auto rounded-lg bg-default-50 p-4 text-sm">
              {content}
            </pre>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  )
}
