import { Checkbox } from '@heroui/react'
import { Card, CardBody } from '@heroui/card'
import { ThumbsUp } from 'lucide-react'
import Link from 'next/link'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { formatDate } from '~/utils/time'
import type { AdminComment } from '~/types/api/admin'
import { CommentEdit } from './CommentEdit'

interface Props {
  comment: AdminComment
  isSelected: boolean
  isSelectionDisabled?: boolean
  onSelectionChange: (isSelected: boolean) => void
  onRefresh: () => Promise<void> | void
}

export const CommentCard = ({
  comment,
  isSelected,
  isSelectionDisabled,
  onSelectionChange,
  onRefresh
}: Props) => {
  return (
    <Card className={isSelected ? 'ring-2 ring-primary-300' : undefined}>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 gap-4">
            <div className="relative min-w-12 flex-shrink-0 pb-6">
              <KunAvatar
                uid={comment.user.id}
                avatarProps={{
                  name: comment.user.name,
                  src: comment.user.avatar
                }}
              />
              <Checkbox
                aria-label={`选择评论 ${comment.id}`}
                className="absolute bottom-0 left-0"
                isDisabled={isSelectionDisabled}
                isSelected={isSelected}
                onValueChange={onSelectionChange}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{comment.user.name}</h2>
                <span className="text-small text-default-500">
                  评论于{' '}
                  <Link className="text-primary-500" href={`/${comment.uniqueId}`}>
                    {comment.patchName}
                  </Link>
                </span>
              </div>

              <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>

              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1 text-small text-default-500">
                  <ThumbsUp size={14} />
                  {comment.like}
                </div>
                <span className="text-small text-default-500">
                  {formatDate(comment.created, {
                    isPrecise: true,
                    isShowYear: true
                  })}
                </span>
              </div>
            </div>
          </div>

          <CommentEdit initialComment={comment} onSuccess={onRefresh} />
        </div>
      </CardBody>
    </Card>
  )
}
