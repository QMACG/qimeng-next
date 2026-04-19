import { Card, CardBody, CardHeader } from '@heroui/card'
import { Avatar } from '@heroui/avatar'
import { Chip } from '@heroui/chip'
import { Divider } from '@heroui/divider'
import { Progress } from '@heroui/progress'
import { Calendar, Link as LinkIcon } from 'lucide-react'
import { formatTimeDifference } from '~/utils/time'
import { USER_ROLE_MAP, USER_STATUS_COLOR_MAP } from '~/constants/user'
import { UserFollow } from './follow/Follow'
import { Stats } from './follow/Stats'
import { SelfButton } from './SelfButton'
import { StartChatButton } from './StartChatButton'
import type { UserInfo } from '~/types/api/user'
import { UserName } from '~/components/kun/user/UserName'
import { toSafeAvatarSrc } from '~/utils/publicAsset'

export const UserProfile = ({ user }: { user: UserInfo }) => {
  const profilePath = `/user/${user.id}`
  const avatarSrc = toSafeAvatarSrc(user.avatar)

  return (
    <div className="lg:col-span-1">
      <Card className="w-full">
        <CardHeader className="justify-center pt-8">
          <div className="flex flex-col items-center gap-3">
            <Avatar
              src={avatarSrc}
              className="h-32 w-32"
              isBordered
              color="primary"
            />
            <div className="flex flex-col items-center gap-1">
              <h4 className="text-2xl font-bold">
                <UserName user={user} className="font-bold" />
              </h4>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <Chip color="primary" variant="flat" size="sm">
                  {USER_ROLE_MAP[user.role]}
                </Chip>
                {user.status === 2 && (
                  <Chip
                    color={USER_STATUS_COLOR_MAP[user.status]}
                    variant="flat"
                    size="sm"
                  >
                    已封禁
                  </Chip>
                )}
              </div>

              <Stats user={user} />
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
          {user.bio && (
            <p className="mb-6 text-center text-default-600">{user.bio}</p>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="size-4 text-default-400" />
              <a
                href={profilePath}
                className="text-small text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {profilePath}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-default-400" />
              <span className="text-small text-default-500">
                加入于 {formatTimeDifference(user.registerTime)}
              </span>
            </div>
          </div>
          <Divider className="my-4" />
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 flex justify-between">
                <span className="text-small">萌萌点</span>
                <span className="text-small text-default-500">
                  {user.moemoepoint}
                </span>
              </div>
              <Progress
                aria-label="萌萌点"
                value={user.moemoepoint % 100}
                color="primary"
                className="h-2"
              />
            </div>

            <div className="flex gap-2">
              {user.id === user.requestUserUid ? (
                <SelfButton user={user} />
              ) : (
                <>
                  <UserFollow
                    uid={user.id}
                    name={user.name}
                    follow={user.isFollow}
                  />
                  <StartChatButton targetUserId={user.id} />
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
