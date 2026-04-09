'use client'

import Link from 'next/link'
import {
  Building2,
  FileClock,
  FilePlus2,
  FileText,
  Gamepad2,
  Handshake,
  Hash,
  Images,
  Mail,
  MessageCircleQuestion,
  MessageSquare,
  NotebookPen,
  PackageOpen,
  Settings,
  TriangleAlert,
  Users
} from 'lucide-react'
import { useUserStore } from '~/store/userStore'

interface MenuItem {
  name: string
  href: string
  icon: typeof Users
  minRole: number
  exact?: boolean
}

const menuItems: MenuItem[] = [
  {
    name: '新建游戏',
    href: '/admin/galgame/new',
    icon: FilePlus2,
    minRole: 2,
    exact: true
  },
  {
    name: '游戏管理',
    href: '/admin/galgame',
    icon: Gamepad2,
    minRole: 2,
    exact: true
  },
  {
    name: '文章管理',
    href: '/admin/doc',
    icon: FileText,
    minRole: 2
  },
  {
    name: '广告管理',
    href: '/admin/advertisement',
    icon: Images,
    minRole: 2
  },
  {
    name: '标签管理',
    href: '/admin/tag',
    icon: Hash,
    minRole: 2
  },
  {
    name: '会社管理',
    href: '/admin/company',
    icon: Building2,
    minRole: 2
  },
  {
    name: '友链管理',
    href: '/admin/friend-link',
    icon: Handshake,
    minRole: 2
  },
  {
    name: '备注管理',
    href: '/admin/resource-note',
    icon: NotebookPen,
    minRole: 3
  },
  {
    name: '直链管理',
    href: '/admin/direct-download',
    icon: PackageOpen,
    minRole: 3
  },
  {
    name: '评论管理',
    href: '/admin/comment',
    icon: MessageSquare,
    minRole: 3
  },
  {
    name: '反馈管理',
    href: '/admin/feedback',
    icon: MessageCircleQuestion,
    minRole: 3
  },
  {
    name: '评论举报',
    href: '/admin/report',
    icon: TriangleAlert,
    minRole: 3
  },
  {
    name: '评分举报',
    href: '/admin/rating-report',
    icon: TriangleAlert,
    minRole: 3
  },
  {
    name: '用户管理',
    href: '/admin/user',
    icon: Users,
    minRole: 3
  },
  {
    name: '管理日志',
    href: '/admin/log',
    icon: FileClock,
    minRole: 3
  },
  {
    name: '站点设置',
    href: '/admin/setting',
    icon: Settings,
    minRole: 3
  },
  {
    name: '邮件群发',
    href: '/admin/email',
    icon: Mail,
    minRole: 3
  }
]

export const SidebarContent = ({ pathname }: { pathname: string }) => {
  const role = useUserStore((state) => state.user.role)
  const visibleItems = menuItems.filter((item) => role >= item.minRole)

  return (
    <nav className="flex-1 p-4 pl-0">
      <ul className="space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-medium px-4 py-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-default-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
