import type { AdminHeaderNavConfig } from '~/types/api/admin'
import type { KunNavItem } from '~/constants/top-bar'

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)

export const toPublicHeaderNavItems = (
  config: AdminHeaderNavConfig
): KunNavItem[] =>
  [...config.items]
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)
    )
    .map((item) => ({
      name: item.name,
      href: item.href,
      isExternal: isAbsoluteUrl(item.href)
    }))
