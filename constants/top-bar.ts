import type { AdminHeaderNavItem, AdminHeaderNavFixedKey } from '~/types/api/admin'

export interface KunNavItem {
  name: string
  href: string
  isExternal?: boolean
}

export const DEFAULT_HEADER_NAV_FIXED_ITEMS: Record<
  AdminHeaderNavFixedKey,
  Omit<AdminHeaderNavItem, 'sortOrder'>
> = {
  galgame: {
    id: 'fixed-galgame',
    key: 'galgame',
    name: '游戏资源',
    href: '/galgame',
    isFixed: true
  },
  tag: {
    id: 'fixed-tag',
    key: 'tag',
    name: '游戏标签',
    href: '/tag',
    isFixed: true
  },
  company: {
    id: 'fixed-company',
    key: 'company',
    name: '会社',
    href: '/company',
    isFixed: true
  },
  doc: {
    id: 'fixed-doc',
    key: 'doc',
    name: '文章',
    href: '/doc',
    isFixed: true
  }
}

export const DEFAULT_HEADER_NAV_ITEMS: AdminHeaderNavItem[] = [
  {
    ...DEFAULT_HEADER_NAV_FIXED_ITEMS.galgame,
    sortOrder: 10
  },
  {
    ...DEFAULT_HEADER_NAV_FIXED_ITEMS.tag,
    sortOrder: 20
  },
  {
    ...DEFAULT_HEADER_NAV_FIXED_ITEMS.company,
    sortOrder: 30
  },
  {
    ...DEFAULT_HEADER_NAV_FIXED_ITEMS.doc,
    sortOrder: 40
  },
  {
    id: 'custom-feedback',
    name: '帮助反馈',
    href: '/doc/help/feedback',
    sortOrder: 50,
    isFixed: false
  }
]
