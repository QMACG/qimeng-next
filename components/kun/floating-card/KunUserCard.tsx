'use client'

import { useEffect, useState } from 'react'
import { User } from '@heroui/react'
import { kunFetchGet } from '~/utils/kunFetch'
import { KunUserStatCard } from './KunUserStatCard'
import { KunLoading } from '../Loading'
import { UserFollow } from '~/components/user/follow/Follow'
import type { FloatingCardUser } from '~/types/api/user'
import { UserName } from '../user/UserName'

interface UserCardProps {
  uid: number
}

export const KunUserCard = ({ uid }: UserCardProps) => {
  const [user, setUser] = useState<FloatingCardUser | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const profile = await kunFetchGet<FloatingCardUser>('/user/profile/floating', {
        uid
      })
      setUser(profile)
    }

    void fetchData()
  }, [uid])

  return (
    <div className="w-[300px] p-2">
      {user ? (
        <>
          <div className="flex items-center justify-between">
            <User
              name={<UserName user={user} className="font-semibold" />}
              description={user.bio || '这个用户还没有留下简介'}
              avatarProps={{
                src: user.avatar,
                isBordered: true,
                color: 'secondary',
                className: 'h-12 w-12 shrink-0'
              }}
              className="mb-2"
            />

            <UserFollow
              uid={user.id}
              name={user.name}
              follow={user.isFollow}
              fullWidth={false}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <KunUserStatCard value={user._count.follower} label="关注者" />
            <KunUserStatCard value={user.receivedFavoriteCount} label="收到喜欢" />
            {user.showContributionStats ? (
              <KunUserStatCard value={user._count.patch} label="游戏数" />
            ) : null}
            {user.showContributionStats ? (
              <KunUserStatCard value={user._count.patch_resource} label="资源数" />
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex min-h-36 items-center justify-center">
          <KunLoading hint="正在加载用户信息..." />
        </div>
      )}
    </div>
  )
}
