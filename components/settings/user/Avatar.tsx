'use client'

import { Card, CardBody, CardFooter } from '@heroui/card'
import { AvatarCrop } from './AvatarCrop'

export const UserAvatar = () => {
  return (
    <Card className="w-full text-sm">
      <CardBody className="flex flex-row items-center justify-between gap-4 pb-0">
        <div>
          <h2 className="mb-4 text-xl font-medium">头像</h2>
          <p>这里可以设置您的个人头像。</p>
          <p>请直接粘贴外部图片链接，不再支持站内上传。</p>
        </div>

        <AvatarCrop />
      </CardBody>

      <CardFooter>
        <p className="py-2 text-default-500">
          头像不是必填项，但设置头像后，其他用户会更容易识别您的账号。
        </p>
      </CardFooter>
    </Card>
  )
}
