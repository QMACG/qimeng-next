'use client'

import { DropdownItem } from '@heroui/dropdown'
import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/modal'
import { LogOut } from 'lucide-react'
import { useUserStore } from '~/store/userStore'
import { useState } from 'react'
import { useRouter } from '@bprogress/next'
import { kunFetchPost } from '~/utils/kunFetch'
import toast from 'react-hot-toast'

export const UserDropdown = () => {
  const router = useRouter()
  const { logout } = useUserStore((state) => state)
  const [loading, setLoading] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const handleLogOut = async () => {
    setLoading(true)
    await kunFetchPost<KunResponse<{}>>('/user/status/logout')
    setLoading(false)
    logout()
    router.push('/login')
    toast.success('已退出登录')
  }

  return (
    <>
      <DropdownItem
        key="logout"
        color="danger"
        startContent={<LogOut className="size-4" />}
        onPress={onOpen}
      >
        退出登录
      </DropdownItem>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                确认退出登录？
              </ModalHeader>
              <ModalBody>
                <p>
                  退出后会清除当前登录状态，但不会清除本地未提交的编辑草稿，稍后重新登录仍可继续编辑。
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleLogOut()
                    onClose()
                  }}
                  isLoading={loading}
                  disabled={loading}
                >
                  确认退出
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
