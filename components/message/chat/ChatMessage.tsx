'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'
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
import { Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import type { PrivateMessage } from '~/types/api/conversation'
import { cn } from '~/utils/cn'
import { kunFetchDelete, kunFetchPut } from '~/utils/kunFetch'
import { formatTimeDifference } from '~/utils/time'

type MessageUpdateData =
  | { action: 'delete' }
  | { action: 'edit'; content: string; editedAt: string | Date }

interface Props {
  message: PrivateMessage
  isOwn: boolean
  conversationId: number
  onMessageUpdated: (data: MessageUpdateData) => void
}

export const ChatMessage = ({
  message,
  isOwn,
  conversationId,
  onMessageUpdated
}: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [editContent, setEditContent] = useState(message.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error('消息内容不能为空')
      return
    }

    setIsSubmitting(true)
    const response = await kunFetchPut<
      KunResponse<{ id: number; content: string; editedAt: string }>
    >(`/message/conversation/${conversationId}`, {
      messageId: message.id,
      content: editContent.trim()
    })

    if (typeof response === 'string') {
      toast.error(response)
    } else {
      toast.success('消息已编辑')
      onClose()
      onMessageUpdated({
        action: 'edit',
        content: response.content,
        editedAt: response.editedAt
      })
    }

    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    const response = await kunFetchDelete<KunResponse<{}>>(
      `/message/conversation/${conversationId}`,
      { messageId: message.id }
    )

    if (typeof response === 'string') {
      toast.error(response)
    } else {
      toast.success('消息已删除')
      onMessageUpdated({ action: 'delete' })
    }

    setIsSubmitting(false)
  }

  if (message.isDeleted) {
    return (
      <div
        className={cn(
          'mb-4 flex gap-3',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <KunAvatar
          uid={message.sender.id}
          avatarProps={{
            src: message.sender.avatar,
            name: message.sender.name,
            className: 'shrink-0'
          }}
        />
        <div className="max-w-[70%] rounded-2xl bg-default-100 px-4 py-2 dark:bg-default-200">
          <p className="text-sm italic text-default-400">
            {message.sender.name} 删除了一条消息
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          'mb-4 flex gap-3',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <KunAvatar
          uid={message.sender.id}
          avatarProps={{
            src: message.sender.avatar,
            name: message.sender.name,
            className: 'shrink-0'
          }}
        />

        {isOwn ? (
          <Dropdown isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownTrigger>
              <div
                className="max-w-[70%] cursor-pointer rounded-2xl bg-primary-500 px-4 py-2 text-white"
                onContextMenu={(e) => {
                  e.preventDefault()
                  setIsMenuOpen(true)
                }}
                onClick={() => setIsMenuOpen(true)}
              >
                <p className="break-words whitespace-pre-wrap text-sm">
                  {message.content}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-primary-100">
                  <span>{formatTimeDifference(message.created)}</span>
                  {message.editedAt && <span>（已编辑）</span>}
                </div>
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="消息操作">
              <DropdownItem
                key="edit"
                startContent={<Pencil className="size-4" />}
                onPress={() => {
                  setEditContent(message.content)
                  onOpen()
                }}
              >
                编辑
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<Trash2 className="size-4" />}
                onPress={handleDelete}
              >
                删除
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <div className="max-w-[70%] rounded-2xl bg-default-100 px-4 py-2 dark:bg-default-200">
            <p className="break-words whitespace-pre-wrap text-sm">
              {message.content}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-default-400">
              <span>{formatTimeDifference(message.created)}</span>
              {message.editedAt && <span>（已编辑）</span>}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>编辑消息</ModalHeader>
          <ModalBody>
            <Textarea
              value={editContent}
              onValueChange={setEditContent}
              minRows={2}
              maxRows={10}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="primary"
              isLoading={isSubmitting}
              onPress={handleEdit}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
