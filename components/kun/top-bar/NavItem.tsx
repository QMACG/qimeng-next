'use client'

import { NavbarContent, NavbarItem } from '@heroui/navbar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { KunNavItem } from '~/constants/top-bar'

interface Props {
  items: KunNavItem[]
}

const isItemActive = (pathname: string, href: string, isExternal = false) => {
  if (isExternal) {
    return false
  }

  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export const NavItem = ({ items }: Props) => {
  const pathname = usePathname()

  return (
    <NavbarContent className="hidden gap-3 sm:flex">
      {items.map((item) => {
        const isActive = isItemActive(pathname, item.href, item.isExternal)

        return (
          <NavbarItem key={`${item.href}-${item.name}`} isActive={isActive}>
            <Link
              className={isActive ? 'text-primary' : 'text-foreground'}
              href={item.href}
              target={item.isExternal ? '_blank' : undefined}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
            >
              {item.name}
            </Link>
          </NavbarItem>
        )
      })}
    </NavbarContent>
  )
}
