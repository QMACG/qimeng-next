'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@bprogress/next'
import {
  ArrowLeftRight,
  CalendarCheck,
  CircleHelp,
  LogOut,
  Lollipop,
  Settings,
  Shield,
  Sparkles,
  UserRound
} from 'lucide-react'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/dropdown'
import { Avatar } from '@heroui/avatar'
import { Button } from '@heroui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/modal'
import toast from 'react-hot-toast'
import { useMounted } from '~/hooks/useMounted'
import { useSettingStore } from '~/store/settingStore'
import { useUserStore } from '~/store/userStore'
import { kunFetchGet, kunFetchPost } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'
import { showKunSooner } from '~/components/kun/Sooner'
import { NSFWSwitcher } from './NSFWSwitcher'
import type { UserState } from '~/store/userStore'
import { UserName } from '../user/UserName'

export const UserDropdown = () => {
  const router = useRouter()
  const { user, setUser, logout } = useUserStore((state) => state)
  const resetSettingData = useSettingStore((state) => state.resetData)
  const isMounted = useMounted()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    if (!isMounted || !user.uid) {
      return
    }

    const getUserStatus = async () => {
      const latestUser = await kunFetchGet<UserState>('/user/status')
      setUser(latestUser)
    }

    void getUserStatus()
  }, [isMounted, setUser, user.uid])

  const handleLogOut = async () => {
    setLoading(true)
    const response = await kunFetchPost<KunResponse<{}> | string>(
      '/user/status/logout'
    )
    setLoading(false)

    if (typeof response === 'string') {
      toast.error(response)
      return
    }

    logout()
    resetSettingData()
    router.push('/login')
    router.refresh()
    toast.success('已退出登录')
  }

  const handleCheckIn = async () => {
    if (checking) {
      return
    }

    setChecking(true)
    const res = await kunFetchPost<
      KunResponse<{
        randomMoemoepoints: number
      }>
    >('/user/status/check-in')

    kunErrorHandler(res, (value) => {
      showKunSooner(
        value
          ? `签到成功，今天获得了 ${value.randomMoemoepoints} 萌萌点`
          : '今天没有获得萌萌点，下次再试试吧'
      )

      setUser({
        ...user,
        dailyCheckIn: 1,
        moemoepoint: user.moemoepoint + value.randomMoemoepoints
      })
    })

    setChecking(false)
  }

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            isBordered
            as="button"
            className="shrink-0 transition-transform"
            color="secondary"
            name={user.name.charAt(0).toUpperCase()}
            size="sm"
            src={user.avatar}
            showFallback
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="用户菜单"
          disabledKeys={user.dailyCheckIn ? ['check'] : []}
        >
          <DropdownItem
            isReadOnly
            key="username"
            textValue="用户名"
            className="cursor-default data-[hover=true]:bg-background"
          >
            <UserName user={user} className="font-semibold" />
          </DropdownItem>
          <DropdownItem
            isReadOnly
            textValue="萌萌点"
            key="moemoepoint"
            className="cursor-default data-[hover=true]:bg-background"
            startContent={<Lollipop className="size-4" />}
            endContent={user.moemoepoint}
          >
            萌萌点
          </DropdownItem>
          <DropdownItem
            key="profile"
            onPress={() => router.push(`/user/${user.uid}/comment`)}
            startContent={<UserRound className="size-4" />}
          >
            个人主页
          </DropdownItem>

          {user.role >= 2 ? (
            <DropdownItem
              key="admin"
              onPress={() => router.push('/admin/galgame')}
              startContent={<Shield className="size-4" />}
            >
              后台管理
            </DropdownItem>
          ) : null}

          <DropdownItem
            key="settings"
            onPress={() => router.push('/settings/user')}
            startContent={<Settings className="size-4" />}
          >
            账户设置
          </DropdownItem>
          <DropdownItem
            key="help_and_feedback"
            onPress={() => router.push('/doc/help/feedback')}
            startContent={<CircleHelp className="size-4" />}
          >
            帮助反馈
          </DropdownItem>
          <DropdownItem
            isReadOnly
            textValue="内容显示范围"
            key="nsfw_toggle"
            startContent={<ArrowLeftRight className="size-4" />}
          >
            <NSFWSwitcher />
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            startContent={<LogOut className="size-4" />}
            onPress={onOpen}
          >
            退出登录
          </DropdownItem>

          <DropdownItem
            key="check"
            textValue="今日签到"
            color="secondary"
            startContent={<CalendarCheck className="size-4" />}
            endContent={
              user.dailyCheckIn ? (
                <span className="text-xs">今天已签到</span>
              ) : (
                <Sparkles className="size-5 text-secondary-500" />
              )
            }
            onPress={handleCheckIn}
          >
            今日签到
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                确认退出登录？
              </ModalHeader>
              <ModalBody>
                <p>
                  退出后会清除当前登录状态，并恢复默认内容显示范围，但不会清除本地未提交的草稿。
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    void handleLogOut()
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
