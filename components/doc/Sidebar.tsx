'use client'

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Link,
  useDisclosure
} from '@heroui/react'
import { KunTreeNode } from '~/lib/mdx/types'
import { ChevronRight } from 'lucide-react'
import { SidebarContent } from './SidebarContent'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  tree: KunTreeNode
}

export const KunSidebar = ({ tree }: Props) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
  const pathname = usePathname()

  useEffect(() => onClose(), [pathname, onClose])

  return (
    <div className="kun-scroll-nav">
      <aside className="fixed top-32 hidden h-[calc(100dvh-256px)] w-64 bg-background md:block">
        <div className="flex h-full flex-col overflow-scroll border-r border-default-200 bg-background px-4 scrollbar-hide">
          <Link color="foreground" href="/doc" className="my-3 text-xl">
            文章目录
          </Link>
          <SidebarContent tree={tree} />
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
          <DrawerHeader className="flex flex-col gap-1">文章目录</DrawerHeader>
          <DrawerBody>{SidebarContent({ tree })}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
