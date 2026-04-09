'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Send } from 'lucide-react'
import { kunFetchPost } from '~/utils/kunFetch'
import toast from 'react-hot-toast'
import { useUserStore } from '~/store/userStore'
import { kunErrorHandler } from '~/utils/kunErrorHandler'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { KunEditor } from '~/components/kun/milkdown/Editor'
import { useKunMilkdownStore } from '~/store/milkdownStore'
import type { PatchComment } from '~/types/api/patch'

interface CreateCommentProps {
  patchId: number
  receiverUsername: string | null | undefined
  parentId?: number | null
  setNewComment: (newComment: PatchComment) => void
  onSuccess?: () => void
  onCancel?: () => void
}

export const PublishComment = ({
  patchId,
  parentId = null,
  receiverUsername = null,
  setNewComment,
  onSuccess,
  onCancel
}: CreateCommentProps) => {
  const [loading, setLoading] = useState(false)
  const { user } = useUserStore((state) => state)
  const refreshMilkdownContent = useKunMilkdownStore(
    (state) => state.refreshMilkdownContent
  )
  const [content, setContent] = useState('')

  const handlePublishComment = async () => {
    setLoading(true)
    const res = await kunFetchPost<KunResponse<PatchComment>>('/patch/comment', {
      patchId,
      parentId,
      content: content.trim()
    })

    kunErrorHandler(res, (value) => {
      setNewComment({
        ...value,
        user: { id: user.uid, name: user.name, avatar: user.avatar }
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
          {receiverUsername ? <span className="text-sm">回复 @{receiverUsername}</span> : null}
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
