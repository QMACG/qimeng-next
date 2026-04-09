export interface KunNavItem {
  name: string
  href: string
}

export const kunNavItem: KunNavItem[] = [
  {
    name: '游戏资源',
    href: '/galgame'
  },
  {
    name: '游戏标签',
    href: '/tag'
  },
  {
    name: '会社',
    href: '/company'
  },
  {
    name: '文章',
    href: '/doc'
  }
]

export const kunMobileNavItem: KunNavItem[] = [
  ...kunNavItem,
  {
    name: '帮助反馈',
    href: '/doc/help/feedback'
  }
]
