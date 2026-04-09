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
import { kunFetchPost } from '~/utils/kunFetch'
import type { AdminFeedback } from '~/types/api/admin'

interface Props {
  initialFeedback: AdminFeedback
  onHandled: () => void
}

export const FeedbackHandler = ({ initialFeedback, onHandled }: Props) => {
  const currentUser = useUserStore((state) => state.user)
  const [handleContent, setHandleContent] = useState('')
  const [updating, setUpdating] = useState(false)

  const {
    isOpen: isOpenHandle,
    onOpen: onOpenHandle,
    onClose: onCloseHandle
  } = useDisclosure()

  const handleUpdateFeedback = async () => {
    setUpdating(true)

    const res = await kunFetchPost<KunResponse<{}>>('/admin/feedback/handle', {
      commentId: initialFeedback.id,
      content: handleContent.trim()
    })

    if (typeof res === 'string') {
      toast.error(res)
    } else {
      onCloseHandle()
      setHandleContent('')
      onHandled()
      toast.success('反馈处理成功')
    }

    setUpdating(false)
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

        <DropdownMenu disabledKeys={initialFeedback.status ? ['handle'] : []}>
          <DropdownItem key="handle" onPress={onOpenHandle}>
            处理这条反馈
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpenHandle} onClose={onCloseHandle} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">处理反馈</ModalHeader>
          <ModalBody>
            <Textarea
              value={handleContent}
              label="回复内容（可选）"
              onChange={(e) => setHandleContent(e.target.value)}
              placeholder="提交后会在前台评论区追加管理员回复，并标记为已处理"
              minRows={2}
              maxRows={8}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setHandleContent('')
                onCloseHandle()
              }}
            >
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateFeedback}
              isLoading={updating}
              isDisabled={updating}
            >
              标记为已处理
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
