'use client'

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Link,
  useDisclosure
} from '@heroui/react'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { SidebarContent } from './SidebarContent'

export const Sidebar = () => {
  const pathname = usePathname()
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

  useEffect(() => onClose(), [pathname, onClose])

  return (
    <>
      <aside className="fixed z-20 hidden h-full w-64 border-r border-divider bg-background md:static md:block">
        <div className="flex size-full flex-col">
          <Link
            color="foreground"
            href="/admin/galgame"
            className="my-4 text-xl font-bold"
          >
            后台管理
          </Link>
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      <div
        className="fixed left-0 top-0 flex h-full cursor-pointer items-center text-default-500 md:hidden"
        onClick={() => onOpen()}
      >
        <ChevronRight size={24} />
      </div>

      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="left"
        size="xs"
      >
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-1">后台管理</DrawerHeader>
          <DrawerBody>
            <SidebarContent pathname={pathname} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
