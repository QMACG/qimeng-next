'use client'

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Select,
  SelectItem
} from '@heroui/react'
import toast from 'react-hot-toast'
import { useSettingStore } from '~/store/settingStore'
import { useUserStore } from '~/store/userStore'

const options = [
  {
    key: 'sfw',
    label: '仅显示常规内容',
    description: '只显示常规内容，隐藏分级内容。'
  },
  {
    key: 'nsfw',
    label: '仅显示分级内容',
    description: '只显示分级内容。'
  },
  {
    key: 'all',
    label: '显示全部内容',
    description: '同时显示常规内容与分级内容。'
  }
] as const

export const NsfwPreference = () => {
  const { user } = useUserStore((state) => state)
  const settings = useSettingStore((state) => state.data)
  const setData = useSettingStore((state) => state.setData)

  const handleSelectionChange = (value: string) => {
    if (!user.uid) {
      toast.error('请先登录后再修改内容显示设置')
      return
    }

    setData({ kunNsfwEnable: value })
    toast.success('内容显示设置已保存')
  }

  return (
    <Card className="w-full text-sm">
      <CardHeader>
        <h2 className="text-xl font-medium">内容显示偏好</h2>
      </CardHeader>

      <CardBody className="space-y-4 py-0">
        <p>
          你可以在这里设置站内内容的显示范围。部分分级内容需要登录后才可调整显示方式。
        </p>

        <Select
          label="内容显示"
          labelPlacement="outside"
          selectedKeys={new Set([settings.kunNsfwEnable])}
          onChange={(event) => handleSelectionChange(event.target.value)}
        >
          {options.map((option) => (
            <SelectItem key={option.key} description={option.description}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </CardBody>

      <CardFooter>
        <p className="text-default-500">
          修改后会立即生效，首页、游戏列表、搜索结果等页面都会按这里的偏好过滤内容。
        </p>
      </CardFooter>
    </Card>
  )
}
