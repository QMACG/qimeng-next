'use client'

import { useState } from 'react'
import { useRouter } from '@bprogress/next'
import { Button } from '@heroui/button'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import toast from 'react-hot-toast'
import { kunFetchPost } from '~/utils/kunFetch'

export const Reset = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleResetData = async () => {
    localStorage.clear()
    onClose()

    setLoading(true)
    await kunFetchPost<KunResponse<{}>>('/user/status/logout')
    setLoading(false)

    router.push('/login')
    toast.success('已清除当前设备上的站点缓存，请重新登录')

    await new Promise((resolve) => {
      setTimeout(resolve, 3000)
    })

    location.reload()
  }

  return (
    <Card className="w-full text-sm">
      <CardHeader>
        <h2 className="text-xl font-medium">清除站点数据</h2>
      </CardHeader>

      <CardBody className="space-y-4 py-0">
        <div>
          <p>
            如果站点出现异常，例如页面缓存错误、旧数据未刷新等，可以尝试清除当前设备上的站点数据。
          </p>
          <p>该操作不会影响您在服务器上的账户信息，但需要重新登录。</p>
        </div>
      </CardBody>

      <CardFooter className="flex-wrap">
        <p className="text-danger-500">注意：此操作不可撤销。</p>

        <Button
          color="danger"
          variant="solid"
          className="ml-auto"
          onPress={onOpen}
          isLoading={loading}
        >
          清除
        </Button>
      </CardFooter>

      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            确认清除当前设备上的站点数据吗？
          </ModalHeader>
          <ModalBody>
            <p>
              清除后会删除当前浏览器保存的站点缓存与本地数据，并退出登录，需要重新登录后才能继续使用。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              isLoading={loading}
              color="primary"
              onPress={handleResetData}
            >
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  )
}
