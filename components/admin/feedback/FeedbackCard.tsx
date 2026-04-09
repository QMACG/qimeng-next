'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Chip } from '@heroui/react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { FeedbackCommentContent } from '~/components/doc/feedback/CommentContent'
import { FeedbackClientInfo } from '~/components/doc/feedback/ClientInfo'
import { UserName } from '~/components/kun/user/UserName'
import { formatDate } from '~/utils/time'
import { kunFetchDelete } from '~/utils/kunFetch'
import type { AdminFeedback } from '~/types/api/admin'
import { FeedbackHandler } from './FeedbackHandler'

interface Props {
  feedback: AdminFeedback
  onHandled: () => void
}

export const FeedbackCard = ({ feedback, onHandled }: Props) => {
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null)

  const handleDelete = async (commentId: number) => {
    setDeletingCommentId(commentId)

    try {
      const response = await kunFetchDelete<KunResponse<{}>>('/doc/comment', {
        commentId
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success('反馈评论已删除')
      onHandled()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除反馈评论失败')
    } finally {
      setDeletingCommentId(null)
    }
  }

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <KunAvatar
              uid={feedback.sender.id}
              avatarProps={{
                name: feedback.sender.name,
                src: feedback.sender.avatar
              }}
            />

            <div className="min-w-0 flex-1">
              <div className="space-y-1">
                <FeedbackClientInfo clientInfo={feedback.clientInfo} />
                <div className="flex items-center gap-2">
                  <UserName user={feedback.sender} className="font-semibold" />
                  <span className="text-small text-default-500">
                    {formatDate(feedback.created, {
                      isPrecise: true,
                      isShowYear: true
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <FeedbackCommentContent content={feedback.content} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Chip
                  color={feedback.status ? 'success' : 'danger'}
                  variant="flat"
                >
                  {feedback.status ? '已处理' : '未处理'}
                </Chip>

                <Button
                  as={Link}
                  size="sm"
                  color="primary"
                  variant="flat"
                  href={feedback.link}
                >
                  前往反馈页
                </Button>

                <Button
                  as={Link}
                  size="sm"
                  color="primary"
                  variant="flat"
                  href={`/user/${feedback.sender.id}/comment`}
                >
                  查看用户
                </Button>

                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  startContent={<Trash2 className="size-4" />}
                  isLoading={deletingCommentId === feedback.id}
                  onPress={() => void handleDelete(feedback.id)}
                >
                  删除主评论
                </Button>
              </div>

              {feedback.reply.length > 0 ? (
                <div className="mt-4 space-y-3 rounded-large bg-default-50 p-4">
                  {feedback.reply.map((reply) => (
                    <div key={reply.id} className="space-y-2">
                      <FeedbackClientInfo clientInfo={reply.clientInfo} />
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-default-700">
                          <UserName user={reply.user} className="font-medium" />
                        </div>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          startContent={<Trash2 className="size-4" />}
                          isLoading={deletingCommentId === reply.id}
                          onPress={() => void handleDelete(reply.id)}
                        >
                          删除回复
                        </Button>
                      </div>
                      <FeedbackCommentContent content={reply.content} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <FeedbackHandler initialFeedback={feedback} onHandled={onHandled} />
        </div>
      </CardBody>
    </Card>
  )
}
