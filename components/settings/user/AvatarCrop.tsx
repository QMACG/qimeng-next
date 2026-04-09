'use client'

import { useState } from 'react'
import { Avatar, Button } from '@heroui/react'
import { Input } from '@heroui/input'
import { Link2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUserStore } from '~/store/userStore'
import { kunFetchPost } from '~/utils/kunFetch'
import { avatarSchema } from '~/validations/user'

export const AvatarCrop = () => {
  const { user, setUser } = useUserStore((state) => state)
  const [avatar, setAvatar] = useState(user.avatar)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const result = avatarSchema.safeParse({ avatar })
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? '请输入有效的图片链接')
      return
    }

    setError('')
    setLoading(true)

    const res = await kunFetchPost<KunResponse<{ avatar: string }>>(
      '/user/setting/avatar',
      { avatar }
    )

    setLoading(false)

    if (typeof res === 'string') {
      toast.error(res)
      return
    }

    setUser({ ...user, avatar: res.avatar })
    toast.success('头像更新成功')
  }

  return (
    <div className="flex w-full flex-col gap-4 sm:w-auto sm:min-w-80">
      <div className="flex items-center gap-4">
        <Avatar
          name={user.name}
          src={avatar || user.avatar}
          className="h-16 w-16"
          color="primary"
        />

        <Button
          color="primary"
          variant="flat"
          startContent={<Link2 className="size-4" />}
          onPress={handleSave}
          isLoading={loading}
          disabled={loading}
        >
          保存头像
        </Button>
      </div>

      <Input
        label="头像链接"
        placeholder="https://example.com/avatar.jpg"
        value={avatar}
        onValueChange={setAvatar}
        isInvalid={!!error}
        errorMessage={error}
      />
    </div>
  )
}
