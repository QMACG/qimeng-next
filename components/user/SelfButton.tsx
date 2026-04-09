'use client'

import { Button } from '@heroui/button'
import { Pencil, Shield } from 'lucide-react'
import { useRouter } from '@bprogress/next'
import type { UserInfo } from '~/types/api/user'

interface Props {
  user: UserInfo
}

export const SelfButton = ({ user }: Props) => {
  const router = useRouter()
  const isSelf = user.id === user.requestUserUid
  const canOpenAdmin = isSelf && user.role >= 2

  return (
    <div className="w-full space-y-3">
      <div className="flex space-x-3">
        <Button
          startContent={<Pencil className="size-4" />}
          color="primary"
          variant="flat"
          fullWidth
          onPress={() => router.push('/settings/user')}
        >
          编辑信息
        </Button>

        {canOpenAdmin && (
          <Button
            startContent={<Shield className="size-4" />}
            color="primary"
            variant="solid"
            fullWidth
            onPress={() => router.push('/admin/galgame')}
          >
            进入后台
          </Button>
        )}
      </div>
    </div>
  )
}
