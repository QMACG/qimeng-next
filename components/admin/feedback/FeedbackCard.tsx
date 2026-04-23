'use client'

import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { FeedbackCommentContent } from '~/components/doc/feedback/CommentContent'
import { FeedbackClientInfo } from '~/components/doc/feedback/ClientInfo'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { UserName } from '~/components/kun/user/UserName'
import { getFeedbackCommentStatusMeta } from '~/constants/feedbackComment'
import type { AdminFeedback } from '~/types/api/admin'
import { kunFetchDelete } from '~/utils/kunFetch'
import { formatDate } from '~/utils/time'
import { FeedbackHandler } from './FeedbackHandler'

interface Props {
  feedback: AdminFeedback
  onHandled: () => void
}

export const FeedbackCard = ({ feedback, onHandled }: Props) => {
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  )
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<
    number | null
  >(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const statusMeta = getFeedbackCommentStatusMeta(feedback.status)

  const deleteTargetLabel = useMemo(() => {
    if (pendingDeleteCommentId === null) {
      return ''
    }

    return pendingDeleteCommentId === feedback.id ? '主评论' : '回复'
  }, [feedback.id, pendingDeleteCommentId])

  const openDeleteModal = (commentId: number) => {
    setPendingDeleteCommentId(commentId)
    onOpen()
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

      toast.success('反馈评论已删除')
      setPendingDeleteCommentId(null)
      onClose()
      onHandled()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除反馈评论失败')
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleCloseDeleteModal = () => {
    if (deletingCommentId !== null) {
      return
    }

    setPendingDeleteCommentId(null)
    onClose()
  }

  return (
    <>
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
                    <UserName
                      user={feedback.sender}
                      className="font-semibold"
                    />
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
                  <Chip color={statusMeta.color} variant="flat">
                    {statusMeta.label}
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
                    onPress={() => openDeleteModal(feedback.id)}
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
                            <UserName
                              user={reply.user}
                              className="font-medium"
                            />
                          </div>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            startContent={<Trash2 className="size-4" />}
                            isLoading={deletingCommentId === reply.id}
                            onPress={() => openDeleteModal(reply.id)}
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

      <Modal
        isOpen={isOpen}
        onClose={handleCloseDeleteModal}
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            删除反馈评论
          </ModalHeader>
          <ModalBody>
            <p>
              确认删除这条{deleteTargetLabel || '评论'}吗？删除后将无法恢复。
              {pendingDeleteCommentId === feedback.id
                ? '删除主评论时，其关联回复也会一并移除。'
                : ''}
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
