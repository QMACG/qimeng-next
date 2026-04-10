'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Divider } from '@heroui/divider'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/modal'
import { Pagination } from '@heroui/pagination'
import { Tooltip } from '@heroui/tooltip'
import { MessageCircle, PenLine, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  FEEDBACK_COMMENT_STATUS,
  getFeedbackCommentStatusMeta
} from '~/constants/feedbackComment'
import { KunNull } from '~/components/kun/Null'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { UserName } from '~/components/kun/user/UserName'
import { useUserStore } from '~/store/userStore'
import type { DocComment, DocCommentResponse } from '~/types/api/doc'
import { kunFetchDelete, kunFetchGet } from '~/utils/kunFetch'
import { formatTimeDifference } from '~/utils/time'
import { FeedbackClientInfo } from './ClientInfo'
import { FeedbackCommentContent } from './CommentContent'
import { PublishFeedbackComment } from './PublishComment'

interface Props {
  docPostId: number
  requireCaptcha: boolean
}

const COMMENTS_PER_PAGE = 30

const canEditComment = (viewerUid: number, userId: number) => viewerUid === userId

const canDeleteComment = (viewerUid: number, viewerRole: number, userId: number) =>
  viewerRole >= 3 || viewerUid === userId

export const FeedbackComments = ({ docPostId, requireCaptcha }: Props) => {
  const user = useUserStore((state) => state.user)
  const searchParams = useSearchParams()
  const [comments, setComments] = useState<DocComment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null)
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<
    number | null
  >(null)
  const [replyTo, setReplyTo] = useState<{
    commentId: number
    username: string
  } | null>(null)
  const [editingTarget, setEditingTarget] = useState<{
    commentId: number
    parentId: number | null
  } | null>(null)
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete
  } = useDisclosure()

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
    } else {
      toast.error(res)
    }

    setLoading(false)
  }

  const updateCommentTree = (updatedComment: DocComment) => {
    if (updatedComment.parentId === null) {
      setComments((prev) =>
        prev.map((item) =>
          item.id === updatedComment.id
            ? {
                ...updatedComment,
                reply: item.reply
              }
            : item
        )
      )
      return
    }

    setComments((prev) =>
      prev.map((item) =>
        item.id === updatedComment.parentId
          ? {
              ...item,
              reply: item.reply.map((reply) =>
                reply.id === updatedComment.id ? updatedComment : reply
              )
            }
          : item
      )
    )
  }

  const removeCommentFromTree = (commentId: number) => {
    let removedRoot = false

    setComments((prev) =>
      prev
        .filter((item) => {
          if (item.id === commentId) {
            removedRoot = true
            return false
          }
          return true
        })
        .map((item) => ({
          ...item,
          reply: item.reply.filter((reply) => reply.id !== commentId)
        }))
    )

    if (removedRoot) {
      setTotal((prev) => Math.max(0, prev - 1))
    }
  }

  const openDeleteModal = (commentId: number) => {
    setPendingDeleteCommentId(commentId)
    onOpenDelete()
  }

  const handleDelete = async () => {
    if (!pendingDeleteCommentId) {
      return
    }

    setDeletingCommentId(pendingDeleteCommentId)

    try {
      const response = await kunFetchDelete<KunResponse<{}>>('/doc/comment', {
        commentId: pendingDeleteCommentId
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      removeCommentFromTree(pendingDeleteCommentId)
      if (replyTo?.commentId === pendingDeleteCommentId) {
        setReplyTo(null)
      }
      if (editingTarget?.commentId === pendingDeleteCommentId) {
        setEditingTarget(null)
      }
      toast.success('评论已删除')
      onCloseDelete()
      setPendingDeleteCommentId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除评论失败')
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleCloseDeleteModal = () => {
    if (deletingCommentId !== null) {
      return
    }
    setPendingDeleteCommentId(null)
    onCloseDelete()
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
    <>
      <div id="feedback-comments" className="space-y-4 scroll-mt-24">
        {showEditor ? (
          <PublishFeedbackComment
            mode="create"
            docPostId={docPostId}
            initialValue={prefill}
            requireCaptcha={requireCaptcha}
            onCancel={() => setShowEditor(false)}
            onSuccess={() => setShowEditor(false)}
            onSaved={(newComment) => {
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
          comments.map((comment) => {
            const statusMeta = getFeedbackCommentStatusMeta(comment.status)
            const canEditRoot = canEditComment(user.uid, comment.user.id)
            const canDeleteRoot = canDeleteComment(
              user.uid,
              user.role,
              comment.user.id
            )
            const isEditingRoot = editingTarget?.commentId === comment.id

            return (
              <Card key={comment.id} id={`feedback-comment-${comment.id}`}>
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <KunUser
                      user={comment.user}
                      userProps={{
                        name: (
                          <div className="min-w-0">
                            <FeedbackClientInfo clientInfo={comment.clientInfo} />
                            <UserName user={comment.user} className="font-semibold" />
                          </div>
                        ),
                        description: formatTimeDifference(comment.created),
                        avatarProps: {
                          showFallback: true,
                          name: comment.user.name,
                          src: comment.user.avatar
                        }
                      }}
                    />

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Chip size="sm" variant="flat" color={statusMeta.color}>
                        {statusMeta.label}
                      </Chip>

                      <Tooltip
                        content={
                          replyTo?.commentId === comment.id ? '收起回复' : '回复'
                        }
                      >
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
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
                        </Button>
                      </Tooltip>

                      {canEditRoot ? (
                        <Tooltip content={isEditingRoot ? '取消编辑' : '编辑'}>
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() =>
                              setEditingTarget(
                                isEditingRoot
                                  ? null
                                  : {
                                      commentId: comment.id,
                                      parentId: null
                                    }
                              )
                            }
                          >
                            <PenLine className="size-4" />
                          </Button>
                        </Tooltip>
                      ) : null}

                      {canDeleteRoot ? (
                        <Tooltip content="删除">
                          <Button
                            color="danger"
                            variant="light"
                            isIconOnly
                            size="sm"
                            isLoading={deletingCommentId === comment.id}
                            onPress={() => openDeleteModal(comment.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </Tooltip>
                      ) : null}
                    </div>
                  </div>

                  {isEditingRoot ? (
                    <PublishFeedbackComment
                      mode="edit"
                      commentId={comment.id}
                      initialValue={comment.rawContent}
                      onCancel={() => setEditingTarget(null)}
                      onSuccess={() => setEditingTarget(null)}
                      onSaved={(updatedComment) => {
                        updateCommentTree(updatedComment)
                        setEditingTarget(null)
                      }}
                    />
                  ) : (
                    <FeedbackCommentContent content={comment.content} />
                  )}

                  {replyTo?.commentId === comment.id ? (
                    <div className="pl-4">
                      <PublishFeedbackComment
                        mode="create"
                        docPostId={docPostId}
                        parentId={comment.id}
                        receiverUsername={replyTo.username}
                        adminFeedbackRootId={
                          user.role >= 3 ? comment.id : undefined
                        }
                        requireCaptcha={requireCaptcha}
                        onSuccess={() => setReplyTo(null)}
                        onCancel={() => setReplyTo(null)}
                        onHandled={() => {
                          setReplyTo(null)
                          void fetchComments(page)
                        }}
                        onSaved={(newComment) => {
                          setComments((prev) =>
                            prev.map((item) =>
                              item.id === comment.id
                                ? {
                                    ...item,
                                    status:
                                      user.role >= 3
                                        ? FEEDBACK_COMMENT_STATUS.inProgress
                                        : item.status,
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
                        {comment.reply.map((reply) => {
                          const canEditReply = canEditComment(user.uid, reply.user.id)
                          const canDeleteReply = canDeleteComment(
                            user.uid,
                            user.role,
                            reply.user.id
                          )
                          const isEditingReply = editingTarget?.commentId === reply.id

                          return (
                            <div
                              key={reply.id}
                              id={`feedback-comment-${reply.id}`}
                              className="space-y-2"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <KunUser
                                  user={reply.user}
                                  userProps={{
                                    name: (
                                      <div className="min-w-0">
                                        <FeedbackClientInfo
                                          clientInfo={reply.clientInfo}
                                        />
                                        <UserName
                                          user={reply.user}
                                          className="font-semibold"
                                        />
                                      </div>
                                    ),
                                    description: formatTimeDifference(reply.created),
                                    avatarProps: {
                                      showFallback: true,
                                      name: reply.user.name,
                                      src: reply.user.avatar,
                                      size: 'sm'
                                    }
                                  }}
                                />

                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  {canEditReply ? (
                                    <Tooltip
                                      content={isEditingReply ? '取消编辑' : '编辑'}
                                    >
                                      <Button
                                        isIconOnly
                                        variant="light"
                                        size="sm"
                                        onPress={() =>
                                          setEditingTarget(
                                            isEditingReply
                                              ? null
                                              : {
                                                  commentId: reply.id,
                                                  parentId: comment.id
                                                }
                                          )
                                        }
                                      >
                                        <PenLine className="size-4" />
                                      </Button>
                                    </Tooltip>
                                  ) : null}

                                  {canDeleteReply ? (
                                    <Tooltip content="删除">
                                      <Button
                                        color="danger"
                                        variant="light"
                                        isIconOnly
                                        size="sm"
                                        isLoading={deletingCommentId === reply.id}
                                        onPress={() => openDeleteModal(reply.id)}
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                    </Tooltip>
                                  ) : null}
                                </div>
                              </div>

                              {isEditingReply ? (
                                <PublishFeedbackComment
                                  mode="edit"
                                  commentId={reply.id}
                                  initialValue={reply.rawContent}
                                  onCancel={() => setEditingTarget(null)}
                                  onSuccess={() => setEditingTarget(null)}
                                  onSaved={(updatedComment) => {
                                    updateCommentTree(updatedComment)
                                    setEditingTarget(null)
                                  }}
                                />
                              ) : (
                                <FeedbackCommentContent content={reply.content} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  ) : null}
                </CardBody>
              </Card>
            )
          })}

        {!loading && comments.length === 0 ? (
          <KunNull message="暂时还没有反馈，来发布第一条吧" />
        ) : null}

        {totalPages > 1 ? (
          <div className="mt-4 flex justify-center">
            <Pagination total={totalPages} page={page} onChange={setPage} showControls />
          </div>
        ) : null}
      </div>

      <Modal isOpen={isOpenDelete} onClose={handleCloseDeleteModal} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">删除评论</ModalHeader>
          <ModalBody>
            <p>
              确认删除这条反馈评论吗？删除后其关联回复也会一并移除，且不可撤销。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCloseDeleteModal}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={pendingDeleteCommentId === deletingCommentId}
              isDisabled={pendingDeleteCommentId === null}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
