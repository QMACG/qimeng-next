'use client'

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react'
import { useSettingStore } from '~/store/settingStore'
import { Ban, CircleSlash, ShieldCheck } from 'lucide-react'
import type { JSX } from 'react'

const themeIconMap: Record<string, JSX.Element> = {
  sfw: <ShieldCheck className="size-5" />,
  nsfw: <Ban className="size-5" />,
  all: <CircleSlash className="size-5" />
}

export const NSFWSwitcher = () => {
  const settings = useSettingStore((state) => state.data)
  const setData = useSettingStore((state) => state.setData)

  const themeIcon = themeIconMap[settings.kunNsfwEnable] || themeIconMap.all

  return (
    <Dropdown className="min-w-0">
      <DropdownTrigger>
        <div className="flex justify-between">
          <span>内容显示范围</span>
          <span className="text-default-700">{themeIcon}</span>
        </div>
      </DropdownTrigger>

      <DropdownMenu
        disallowEmptySelection
        selectedKeys={new Set([settings.kunNsfwEnable])}
        selectionMode="single"
        onSelectionChange={(key) => {
          setData({ kunNsfwEnable: key.anchorKey ?? 'sfw' })
          location.reload()
        }}
      >
        {['sfw', 'nsfw', 'all'].map((key) => (
          <DropdownItem
            startContent={themeIconMap[key]}
            textValue={key}
            key={key}
            className="text-default-700"
          >
            {key === 'sfw' && '仅显示常规内容'}
            {key === 'nsfw' && '仅显示分级内容'}
            {key === 'all' && '显示全部内容'}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
