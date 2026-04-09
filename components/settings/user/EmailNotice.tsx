'use client'

import { Switch } from '@heroui/react'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import toast from 'react-hot-toast'
import { useUserStore } from '~/store/userStore'
import { kunFetchPost } from '~/utils/kunFetch'

export const EmailNotice = () => {
  const { user, setUser } = useUserStore((state) => state)

  const handleToggleEmailNotice = async (value: boolean) => {
    if (!user.uid) {
      toast.error('请先登录后再使用该功能')
      return
    }

    const res = await kunFetchPost<KunResponse<{}>>('/user/setting/email-notice')
    if (typeof res !== 'string') {
      setUser({ ...user, enableEmailNotice: value })
      toast.success(value ? '已开启邮件通知' : '已关闭邮件通知')
    }
  }

  return (
    <Card className="w-full text-sm">
      <CardHeader>
        <h2 className="text-xl font-medium">邮件通知</h2>
      </CardHeader>

      <CardBody className="space-y-4 py-0">
        <div>
          <p>当站内有新的系统通知或重要消息时，会通过邮件提醒您。</p>
        </div>
        <div className="flex items-center justify-between">
          <p>是否开启邮件通知</p>
          <Switch
            size="lg"
            color="primary"
            isSelected={user.enableEmailNotice}
            onValueChange={handleToggleEmailNotice}
          />
        </div>
      </CardBody>

      <CardFooter className="flex-wrap">
        <p className="text-default-500">
          您可以随时开启或关闭邮件通知。关闭后，将不再收到站内邮件提醒。
        </p>
      </CardFooter>
    </Card>
  )
}
