'use client'

import { useState } from 'react'
import { Button } from '@heroui/button'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Input } from '@heroui/input'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/modal'
import toast from 'react-hot-toast'
import { useUserStore } from '~/store/userStore'
import { usernameSchema } from '~/validations/user'
import { kunFetchPost } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'

export const Username = () => {
  const { user, setUser } = useUserStore((state) => state)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const handleSave = async () => {
    if (user.moemoepoint < 30) {
      toast.error('修改用户名至少需要 30 萌萌点，当前余额不足')
      return
    }

    const result = usernameSchema.safeParse({ username })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setError('')
    setLoading(true)

    const res = await kunFetchPost<KunResponse<{}>>('/user/setting/username', {
      username
    })

    kunErrorHandler(res, () => {
      toast.success('用户名更新成功')
      setUser({ ...user, name: username, moemoepoint: user.moemoepoint - 30 })
      setUsername('')
    })

    setLoading(false)
  }

  return (
    <Card className="w-full text-sm">
      <CardHeader>
        <h2 className="text-xl font-medium">用户名</h2>
      </CardHeader>

      <CardBody className="space-y-4 py-0">
        <div>
          <p>这里可以修改您的用户名。用户名在站内保持唯一。</p>
        </div>

        <Input
          label="用户名"
          autoComplete="nickname"
          defaultValue={user.name}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          isInvalid={!!error}
          errorMessage={error}
        />
      </CardBody>

      <CardFooter className="flex-wrap">
        <p className="text-default-500">
          用户名最长 17 个字符，修改一次会消耗 30 萌萌点，且操作不可撤销。
        </p>

        <Button
          color="primary"
          variant="solid"
          className="ml-auto"
          onPress={onOpen}
        >
          保存
        </Button>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  确认修改用户名吗？
                </ModalHeader>
                <ModalBody>
                  <p>修改用户名会消耗 30 萌萌点，提交后不可撤销。</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    取消
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      handleSave()
                      onClose()
                    }}
                    isLoading={loading}
                    isDisabled={loading}
                  >
                    确认
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </CardFooter>
    </Card>
  )
}
