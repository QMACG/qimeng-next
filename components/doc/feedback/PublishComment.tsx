'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { KunCaptchaModal } from '~/components/kun/auth/CaptchaModal'
import { KunEditor } from '~/components/kun/milkdown/Editor'
import { UserName } from '~/components/kun/user/UserName'
import { useUserStore } from '~/store/userStore'
import { useKunMilkdownStore } from '~/store/milkdownStore'
import { kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'
import type { DocComment } from '~/types/api/doc'

interface Props {
  docPostId?: number
  commentId?: number
  parentId?: number | null
  receiverUsername?: string | null
  initialValue?: string
  requireCaptcha?: boolean
  mode?: 'create' | 'edit'
  onCancel?: () => void
  onSuccess?: () => void
  onSaved: (comment: DocComment) => void
}

export const PublishFeedbackComment = ({
  docPostId,
  commentId,
  parentId = null,
  receiverUsername = null,
  initialValue = '',
  requireCaptcha = false,
  mode = 'create',
  onCancel,
  onSuccess,
  onSaved
}: Props) => {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(initialValue)
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false)
  const { user } = useUserStore((state) => state)
  const refreshMilkdownContent = useKunMilkdownStore(
    (state) => state.refreshMilkdownContent
  )

  useEffect(() => {
    setContent(initialValue)
  }, [initialValue])

  const requestSave = async (captcha = '') => {
    setLoading(true)
    try {
      const response =
        mode === 'edit'
          ? await kunFetchPut<KunResponse<DocComment>>('/doc/comment', {
              commentId,
              content: content.trim()
            })
          : await kunFetchPost<KunResponse<DocComment>>('/doc/comment', {
              docPostId,
              parentId,
              captcha,
              content: content.trim()
            })

      kunErrorHandler(response, (value) => {
        onSaved(value)
        toast.success(mode === 'edit' ? '评论修改成功' : '评论发布成功')
        if (mode === 'create') {
          setContent('')
          refreshMilkdownContent()
        }
        onSuccess?.()
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '提交评论失败')
    } finally {
      setLoading(false)
      setIsCaptchaOpen(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      return
    }

    if (mode === 'create' && requireCaptcha && user.role < 3) {
      setIsCaptchaOpen(true)
      return
    }

    await requestSave()
  }

  return (
    <>
      <Card>
        <CardHeader className="space-x-4 pb-0">
          <KunAvatar
            uid={user.uid}
            avatarProps={{
              showFallback: true,
              name: user.name,
              src: user.avatar
            }}
          />
          <div className="flex flex-col">
            <UserName user={user} className="font-semibold" />
            {receiverUsername ? (
              <span className="text-sm text-default-500">
                回复 @{receiverUsername}
              </span>
            ) : null}
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          <KunEditor valueMarkdown={content} saveMarkdown={setContent} />

          <div className="flex items-center justify-end">
            <div className="flex gap-2">
              {onCancel ? (
                <Button variant="flat" onPress={onCancel}>
                  取消
                </Button>
              ) : null}
              <Button
                color="primary"
                startContent={<Send className="size-4" />}
                isDisabled={!content.trim() || loading}
                isLoading={loading}
                onPress={() => void handleSubmit()}
              >
                {mode === 'edit' ? '保存修改' : '发布评论'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <KunCaptchaModal
        isOpen={isCaptchaOpen}
        onClose={() => {
          if (!loading) {
            setIsCaptchaOpen(false)
          }
        }}
        onSuccess={(code) => {
          void requestSave(code)
        }}
      />
    </>
  )
}
