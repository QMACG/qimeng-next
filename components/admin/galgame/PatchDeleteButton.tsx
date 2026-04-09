'use client'

import { useState } from 'react'
import { useRouter } from '@bprogress/next'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { kunFetchDelete } from '~/utils/kunFetch'

interface Props {
  patchId: number
}

export const PatchDeleteButton = ({ patchId }: Props) => {
  const router = useRouter()
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    const response = await kunFetchDelete<KunResponse<{}>>('/patch', {
      patchId
    })

    if (typeof response === 'string') {
      toast.error(response)
      setDeleting(false)
      return
    }

    toast.success('游戏已删除')
    router.push('/admin/galgame')
  }

  return (
    <>
      <Button
        color="danger"
        variant="flat"
        startContent={<Trash2 className="size-4" />}
        onPress={onOpen}
      >
        删除游戏
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          <ModalHeader>删除游戏</ModalHeader>
          <ModalBody>
            删除后会同时移除该游戏下的资源、评论及相关记录，这个操作不可撤销。
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={deleting}
              isDisabled={deleting}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
