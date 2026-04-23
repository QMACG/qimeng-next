import { prisma } from '~/prisma/index'
import {
  DEFAULT_HEADER_NAV_FIXED_ITEMS,
  DEFAULT_HEADER_NAV_ITEMS
} from '~/constants/top-bar'
import type {
  AdminHeaderNavConfig,
  AdminHeaderNavFixedKey,
  AdminHeaderNavItem
} from '~/types/api/admin'

const toItem = (item: {
  id: number
  nav_key: string | null
  name: string
  href: string
  sort_order: number
  is_fixed: boolean
}): AdminHeaderNavItem => ({
  id: item.nav_key || `custom-${item.id}`,
  key: (item.nav_key as AdminHeaderNavFixedKey | null) ?? undefined,
  name: item.name,
  href: item.href,
  sortOrder: item.sort_order,
  isFixed: item.is_fixed
})

const seedDefaultHeaderNavItems = async () => {
  await prisma.$transaction(
    DEFAULT_HEADER_NAV_ITEMS.map((item, index) =>
      (prisma as any).site_header_nav_item.create({
        data: {
          nav_key: item.key ?? null,
          name: item.name,
          href: item.href,
          sort_order: item.sortOrder ?? (index + 1) * 10,
          is_fixed: item.isFixed
        }
      })
    )
  )
}

export const getHeaderNavConfig = async (): Promise<AdminHeaderNavConfig> => {
  const model = (prisma as any).site_header_nav_item
  const existingItems = await model.findMany({
    orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
  })

  if (!existingItems.length) {
    await seedDefaultHeaderNavItems()
  }

  const items = await model.findMany({
    orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
  })

  const fixedKeys = new Set<string>(
    items
      .filter(
        (item: { nav_key: string | null; is_fixed: boolean }) => item.is_fixed
      )
      .map((item: { nav_key: string | null }) => item.nav_key)
      .filter(Boolean)
  )

  let appendSortOrder = 999000
  for (const [key, fixedItem] of Object.entries(
    DEFAULT_HEADER_NAV_FIXED_ITEMS
  )) {
    if (!fixedKeys.has(key)) {
      await model.create({
        data: {
          nav_key: key,
          name: fixedItem.name,
          href: fixedItem.href,
          sort_order: appendSortOrder,
          is_fixed: true
        }
      })
      appendSortOrder += 10
    }
  }

  const normalizedItems = await model.findMany({
    orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
  })

  return {
    items: normalizedItems.map(toItem)
  }
}
