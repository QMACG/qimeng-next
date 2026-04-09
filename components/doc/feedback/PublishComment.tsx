'use client'

import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { KunEditor } from '~/components/kun/milkdown/Editor'
import { useUserStore } from '~/store/userStore'
import { useKunMilkdownStore } from '~/store/milkdownStore'
import { kunFetchPost } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'
import type { DocComment } from '~/types/api/doc'

interface Props {
  docPostId: number
  parentId?: number | null
  receiverUsername?: string | null
  initialValue?: string
  onCancel?: () => void
  onSuccess?: () => void
  setNewComment: (comment: DocComment) => void
}

export const PublishFeedbackComment = ({
  docPostId,
  parentId = null,
  receiverUsername = null,
  initialValue = '',
  onCancel,
  onSuccess,
  setNewComment
}: Props) => {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(initialValue)
  const { user } = useUserStore((state) => state)
  const refreshMilkdownContent = useKunMilkdownStore(
    (state) => state.refreshMilkdownContent
  )

  useEffect(() => {
    setContent(initialValue)
  }, [initialValue])

  const handlePublishComment = async () => {
    setLoading(true)
    const res = await kunFetchPost<KunResponse<DocComment>>('/doc/comment', {
      docPostId,
      parentId,
      content: content.trim()
    })

    kunErrorHandler(res, (value) => {
      setNewComment({
        ...value,
        user: {
          id: user.uid,
          name: user.name,
          avatar: user.avatar
        }
      })
      toast.success('评论发布成功')
      setContent('')
      refreshMilkdownContent()
      onSuccess?.()
    })

    setLoading(false)
  }

  return (
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
          <span className="font-semibold">{user.name}</span>
          {receiverUsername ? (
            <span className="text-sm text-default-500">回复 @{receiverUsername}</span>
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
              onPress={handlePublishComment}
            >
              发布评论
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
