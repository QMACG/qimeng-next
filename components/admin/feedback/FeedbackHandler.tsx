'use client'

import { useMemo, useState } from 'react'
import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/dropdown'
import { Select, SelectItem, Textarea } from '@heroui/react'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/modal'
import { MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUserStore } from '~/store/userStore'
import type { AdminFeedback } from '~/types/api/admin'
import { kunFetchPost } from '~/utils/kunFetch'

type FeedbackHandleStatus = 'in_progress' | 'resolved' | 'suspended' | 'closed'

const statusOptions: Array<{
  key: FeedbackHandleStatus
  label: string
  description: string
}> = [
  {
    key: 'in_progress',
    label: '处理中',
    description: '仅回复时建议使用，表示管理员已接手处理。'
  },
  {
    key: 'resolved',
    label: '已处理',
    description: '问题已确认处理完成。'
  },
  {
    key: 'suspended',
    label: '挂起',
    description: '暂不继续推进，等待后续信息或条件。'
  },
  {
    key: 'closed',
    label: '关闭',
    description: '垃圾反馈或无需继续处理的内容。'
  }
]

interface Props {
  initialFeedback: AdminFeedback
  onHandled: () => void
}

export const FeedbackHandler = ({ initialFeedback, onHandled }: Props) => {
  const currentUser = useUserStore((state) => state.user)
  const [handleContent, setHandleContent] = useState('')
  const [status, setStatus] = useState<FeedbackHandleStatus>('in_progress')
  const [updating, setUpdating] = useState(false)

  const {
    isOpen: isOpenHandle,
    onOpen: onOpenHandle,
    onClose: onCloseHandle
  } = useDisclosure()

  const currentStatusDescription = useMemo(
    () => statusOptions.find((item) => item.key === status)?.description ?? '',
    [status]
  )

  const openWithStatus = (nextStatus: FeedbackHandleStatus) => {
    setStatus(nextStatus)
    onOpenHandle()
  }

  const resetState = () => {
    setHandleContent('')
    setStatus('in_progress')
    onCloseHandle()
  }

  const handleUpdateFeedback = async () => {
    setUpdating(true)

    const res = await kunFetchPost<KunResponse<{}>>('/admin/feedback/handle', {
      commentId: initialFeedback.id,
      status,
      content: handleContent.trim()
    })

    if (typeof res === 'string') {
      toast.error(res)
    } else {
      resetState()
      onHandled()
      toast.success('反馈状态已更新')
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

        <DropdownMenu>
          <DropdownItem
            key="in_progress"
            onPress={() => openWithStatus('in_progress')}
          >
            回复并标记处理中
          </DropdownItem>
          <DropdownItem
            key="resolved"
            onPress={() => openWithStatus('resolved')}
          >
            回复并标记已处理
          </DropdownItem>
          <DropdownItem
            key="suspended"
            onPress={() => openWithStatus('suspended')}
          >
            标记挂起
          </DropdownItem>
          <DropdownItem key="closed" onPress={() => openWithStatus('closed')}>
            标记关闭
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpenHandle} onClose={resetState} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">处理反馈</ModalHeader>
          <ModalBody className="space-y-4">
            <Select
              label="处理状态"
              selectedKeys={new Set([status])}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0] as
                  | FeedbackHandleStatus
                  | undefined
                if (key) {
                  setStatus(key)
                }
              }}
            >
              {statusOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <p className="text-sm text-default-500">
              {currentStatusDescription}
            </p>

            <Textarea
              value={handleContent}
              label="回复内容（可选）"
              onChange={(e) => setHandleContent(e.target.value)}
              placeholder="提交后会在前台反馈区追加管理员回复。"
              minRows={2}
              maxRows={8}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={resetState}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateFeedback}
              isLoading={updating}
              isDisabled={updating}
            >
              提交处理
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
