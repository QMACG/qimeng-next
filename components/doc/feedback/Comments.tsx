'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Divider } from '@heroui/divider'
import { Pagination } from '@heroui/pagination'
import { MessageCircle, PenLine } from 'lucide-react'
import { KunNull } from '~/components/kun/Null'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { formatTimeDifference } from '~/utils/time'
import { kunFetchGet } from '~/utils/kunFetch'
import { useUserStore } from '~/store/userStore'
import type { DocComment, DocCommentResponse } from '~/types/api/doc'
import { PublishFeedbackComment } from './PublishComment'
import { FeedbackCommentContent } from './CommentContent'

interface Props {
  docPostId: number
}

const COMMENTS_PER_PAGE = 30

export const FeedbackComments = ({ docPostId }: Props) => {
  const user = useUserStore((state) => state.user)
  const searchParams = useSearchParams()
  const [comments, setComments] = useState<DocComment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [replyTo, setReplyTo] = useState<{
    commentId: number
    username: string
  } | null>(null)

  const prefill = useMemo(() => searchParams.get('prefill') ?? '', [searchParams])

  useEffect(() => {
    if (prefill.trim()) {
      setShowEditor(true)
    }
  }, [prefill])

  const fetchComments = async (pageNum: number) => {
    setLoading(true)
    const res = await kunFetchGet<DocCommentResponse | string>('/doc/comment', {
      docPostId,
      page: pageNum,
      limit: COMMENTS_PER_PAGE
    })

    if (typeof res !== 'string') {
      setComments(res.comments)
      setTotal(res.total)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!user.uid) {
      return
    }
    void fetchComments(page)
  }, [docPostId, page, user.uid])

  if (!user.uid) {
    return <KunNull message="请先登录后再查看和发布反馈评论" />
  }

  const totalPages = Math.ceil(total / COMMENTS_PER_PAGE)

  return (
    <div id="feedback-comments" className="space-y-4 scroll-mt-24">
      {showEditor ? (
        <PublishFeedbackComment
          docPostId={docPostId}
          initialValue={prefill}
          onCancel={() => setShowEditor(false)}
          onSuccess={() => setShowEditor(false)}
          setNewComment={(newComment) => {
            setComments((prev) => [newComment, ...prev])
            setTotal((prev) => prev + 1)
          }}
        />
      ) : (
        <div className="flex justify-end">
          <Button
            color="primary"
            variant="flat"
            startContent={<PenLine className="size-4" />}
            onPress={() => setShowEditor(true)}
          >
            发布反馈
          </Button>
        </div>
      )}

      {loading ? <KunNull message="正在加载评论..." /> : null}

      {!loading &&
        comments.map((comment) => (
          <Card key={comment.id} id={`feedback-comment-${comment.id}`}>
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <KunUser
                  user={comment.user}
                  userProps={{
                    name: comment.user.name,
                    description: formatTimeDifference(comment.created),
                    avatarProps: {
                      showFallback: true,
                      name: comment.user.name,
                      src: comment.user.avatar
                    }
                  }}
                />

                <div className="flex items-center gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={comment.status ? 'success' : 'warning'}
                  >
                    {comment.status ? '已处理' : '待处理'}
                  </Chip>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onPress={() =>
                      setReplyTo(
                        replyTo?.commentId === comment.id
                          ? null
                          : {
                              commentId: comment.id,
                              username: comment.user.name
                            }
                      )
                    }
                  >
                    <MessageCircle className="size-4" />
                    回复
                  </Button>
                </div>
              </div>

              <FeedbackCommentContent content={comment.content} />

              {replyTo?.commentId === comment.id ? (
                <div className="pl-4">
                  <PublishFeedbackComment
                    docPostId={docPostId}
                    parentId={comment.id}
                    receiverUsername={replyTo.username}
                    onSuccess={() => setReplyTo(null)}
                    onCancel={() => setReplyTo(null)}
                    setNewComment={(newComment) => {
                      setComments((prev) =>
                        prev.map((item) =>
                          item.id === comment.id
                            ? {
                                ...item,
                                status: user.role >= 3 ? 1 : item.status,
                                reply: [...item.reply, newComment]
                              }
                            : item
                        )
                      )
                    }}
                  />
                </div>
              ) : null}

              {comment.reply.length > 0 ? (
                <>
                  <Divider />
                  <div className="space-y-4 pl-4">
                    {comment.reply.map((reply) => (
                      <div
                        key={reply.id}
                        id={`feedback-comment-${reply.id}`}
                        className="space-y-2"
                      >
                        <KunUser
                          user={reply.user}
                          userProps={{
                            name: reply.user.name,
                            description: formatTimeDifference(reply.created),
                            avatarProps: {
                              showFallback: true,
                              name: reply.user.name,
                              src: reply.user.avatar,
                              size: 'sm'
                            }
                          }}
                        />
                        <FeedbackCommentContent content={reply.content} />
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </CardBody>
          </Card>
        ))}

      {!loading && comments.length === 0 ? (
        <KunNull message="暂时还没有反馈，来发布第一条吧" />
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-4 flex justify-center">
          <Pagination total={totalPages} page={page} onChange={setPage} showControls />
        </div>
      ) : null}
    </div>
  )
}
