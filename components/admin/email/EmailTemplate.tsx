'use client'

import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Spinner,
  Textarea,
  useDisclosure
} from '@heroui/react'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { emailTemplates } from '~/constants/email/group-templates'
import { kunFetchPost } from '~/utils/kunFetch'
import { EmailPreview } from './EmailPreview'

export const EmailTemplate = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({})
  const [isSending, setIsSending] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const currentTemplate = emailTemplates.find((t) => t.id === selectedTemplate)

  const getPreviewContent = () => {
    if (!currentTemplate) {
      return ''
    }

    let content = currentTemplate.template
    Object.entries(templateVars).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return content
  }

  const handleSendEmails = async () => {
    if (!currentTemplate) {
      return
    }

    setIsSending(true)
    const response = await kunFetchPost<KunResponse<{ count: number }>>(
      '/admin/mail',
      {
        templateId: selectedTemplate,
        variables: templateVars
      }
    )

    if (typeof response === 'string') {
      toast.error(response)
    } else {
      toast.success(`已向站内 ${response.count} 位用户发送邮件`)
    }

    setIsSending(false)
    setSelectedTemplate('')
    setTemplateVars({})
    onClose()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">群发邮件</h3>
            <p className="text-small text-default-500">
              向站内启用邮件通知的用户发送统一邮件。
            </p>
          </div>

          <RadioGroup
            label="选择邮件模板"
            value={selectedTemplate}
            onValueChange={(value) => {
              setSelectedTemplate(value)
              setTemplateVars({})
            }}
          >
            {emailTemplates.map((template) => (
              <Radio key={template.id} value={template.id}>
                {template.name}
              </Radio>
            ))}
          </RadioGroup>

          <Input
            label="邮件标题"
            placeholder="请输入邮件标题"
            value={templateVars.title || ''}
            onChange={(e) =>
              setTemplateVars({ ...templateVars, title: e.target.value })
            }
          />

          <Textarea
            label="邮件内容"
            placeholder="请输入邮件内容"
            value={templateVars.content || ''}
            onChange={(e) =>
              setTemplateVars({ ...templateVars, content: e.target.value })
            }
            minRows={4}
          />

          <p className="text-sm">
            内容支持 HTML。若需要可视化生成，可先使用{' '}
            <Link
              isExternal
              showAnchorIcon
              href="https://www.wangeditor.com/demo/get-html.html"
            >
              wangEditor
            </Link>{' '}
            编辑，再将输出的 HTML 粘贴到内容输入框中。
          </p>

          <div className="flex justify-end">
            <Button
              color="secondary"
              endContent={<Mail className="h-4 w-4" />}
              onPress={onOpen}
              isDisabled={!currentTemplate}
            >
              发送给全站用户
            </Button>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            确认向全站用户发送以下邮件吗？
          </ModalHeader>
          <ModalBody>
            <EmailPreview
              content={currentTemplate ? getPreviewContent() : ''}
              previewOnly={true}
            />
            {isSending && (
              <Alert
                title="正在发送中"
                description="系统正在向全站用户发送邮件，耗时会随用户量和邮件服务状态变化，请稍候。"
                icon={<Spinner />}
                color="primary"
                variant="faded"
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleSendEmails}
              isDisabled={isSending}
              isLoading={isSending}
            >
              开始发送
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <EmailPreview content={currentTemplate ? getPreviewContent() : ''} />
    </div>
  )
}
