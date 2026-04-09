'use client'

import { useState } from 'react'
import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/dropdown'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/modal'
import { Textarea } from '@heroui/input'
import { MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUserStore } from '~/store/userStore'
import { kunFetchDelete, kunFetchPut } from '~/utils/kunFetch'
import type { AdminComment } from '~/types/api/admin'

interface Props {
  initialComment: AdminComment
  onSuccess?: () => Promise<void> | void
}

export const CommentEdit = ({ initialComment, onSuccess }: Props) => {
  const currentUser = useUserStore((state) => state.user)
  const [editContent, setEditContent] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete
  } = useDisclosure()

  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit
  } = useDisclosure()

  const handleDeleteComment = async () => {
    setDeleting(true)

    try {
      const res = await kunFetchDelete<KunResponse<{}>>('/admin/comment', {
        commentIds: String(initialComment.id)
      })

      if (typeof res === 'string') {
        toast.error(res)
        return
      }

      onCloseDelete()
      toast.success('评论删除成功')
      await onSuccess?.()
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdateComment = async () => {
    if (!editContent.trim()) {
      toast.error('评论内容不能为空')
      return
    }

    setUpdating(true)

    try {
      const res = await kunFetchPut<KunResponse<AdminComment>>('/admin/comment', {
        commentId: initialComment.id,
        content: editContent.trim()
      })

      if (typeof res === 'string') {
        toast.error(res)
        return
      }

      onCloseEdit()
      setEditContent('')
      toast.success('评论更新成功')
      await onSuccess?.()
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            isDisabled={currentUser.role < 3}
          >
            <MoreVertical size={16} />
          </Button>
        </DropdownTrigger>

        <DropdownMenu>
          <DropdownItem
            key="edit"
            onPress={() => {
              setEditContent(initialComment.content)
              onOpenEdit()
            }}
          >
            编辑
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            onPress={onOpenDelete}
          >
            删除
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpenEdit} onClose={onCloseEdit} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">编辑评论</ModalHeader>
          <ModalBody>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              minRows={2}
              maxRows={8}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setEditContent('')
                onCloseEdit()
              }}
            >
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateComment}
              isLoading={updating}
              isDisabled={updating}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenDelete} onClose={onCloseDelete} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">删除评论</ModalHeader>
          <ModalBody>
            <p>确认删除这条评论吗？该操作会同时删除其下的回复，且不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteComment}
              isLoading={deleting}
              isDisabled={deleting}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
