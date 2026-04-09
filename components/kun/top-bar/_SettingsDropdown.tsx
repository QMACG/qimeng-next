'use client'

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react'
import { Eye, EyeOff, Settings } from 'lucide-react'
import { useSettingStore } from '~/store/settingStore'
import { ThemeSwitcher } from './ThemeSwitcher'

export const SettingsDropdown = () => {
  const settings = useSettingStore((state) => state.data)

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" isIconOnly radius="full" className="h-10 w-10">
          <Settings className="size-6 text-default-500" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="站点设置" className="min-w-[240px]">
        <DropdownItem
          key="content_visibility"
          className="h-12"
          startContent={
            settings.kunNsfwEnable === 'sfw' ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )
          }
        >
          内容显示范围
        </DropdownItem>
        <DropdownItem key="theme" textValue="主题切换" className="h-12">
          <ThemeSwitcher />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
