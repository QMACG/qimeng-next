import { Button, Card, CardBody, Chip } from '@heroui/react'
import Link from 'next/link'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { FeedbackCommentContent } from '~/components/doc/feedback/CommentContent'
import { formatDate } from '~/utils/time'
import type { AdminFeedback } from '~/types/api/admin'
import { FeedbackHandler } from './FeedbackHandler'

interface Props {
  feedback: AdminFeedback
  onHandled: () => void
}

export const FeedbackCard = ({ feedback, onHandled }: Props) => {
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
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{feedback.sender.name}</h2>
                <span className="text-small text-default-500">
                  {formatDate(feedback.created, {
                    isPrecise: true,
                    isShowYear: true
                  })}
                </span>
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
              </div>

              {feedback.reply.length > 0 ? (
                <div className="mt-4 space-y-3 rounded-large bg-default-50 p-4">
                  {feedback.reply.map((reply) => (
                    <div key={reply.id} className="space-y-2">
                      <div className="text-sm font-medium text-default-700">
                        {reply.user.name}
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
