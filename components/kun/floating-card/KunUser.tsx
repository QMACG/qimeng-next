'use client'

import { useRouter } from '@bprogress/next'
import { Tooltip } from '@heroui/tooltip'
import { User } from '@heroui/user'
import type { UserProps } from '@heroui/user'
import { KunUserCard } from './KunUserCard'
import { UserName } from '../user/UserName'

interface KunUserProps {
  user: KunUser
  userProps: UserProps
}

export const KunUser = ({ user, userProps }: KunUserProps) => {
  const router = useRouter()

  const { avatarProps, ...restUser } = userProps
  const { alt, name, ...restAvatar } = avatarProps!
  const username = name?.charAt(0).toUpperCase() ?? '杂鱼'
  const altString = alt || username
  const displayName =
    typeof restUser.name === 'string'
      ? restUser.name === user.name
        ? <UserName user={user} />
        : restUser.name
      : restUser.name ?? <UserName user={user} />

  return (
    <Tooltip
      showArrow
      delay={500}
      closeDelay={200}
      content={<KunUserCard uid={user.id} />}
      classNames={{
        content: ['bg-background/70 backdrop-blur-md']
      }}
    >
      <User
        {...restUser}
        name={displayName}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          router.push(`/user/${user.id}/comment`)
        }}
        avatarProps={{
          name: username,
          alt: altString,
          className:
            'cursor-pointer shrink-0 transition-transform duration-200 hover:scale-110',
          ...restAvatar
        }}
        className="cursor-pointer"
      />
    </Tooltip>
  )
}
