'use client'

import { useEffect, useState } from 'react'
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle
} from '@heroui/navbar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { KunTopBarBrand } from './Brand'
import { KunTopBarUser } from './User'
import { KunMobileMenu } from './KunMobileMenu'
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

export const KunTopBar = ({ items }: Props) => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <Navbar
      maxWidth="xl"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{ wrapper: 'px-3 sm:px-6' }}
    >
      <NavbarContent className="sm:hidden" justify="start">
        <li className="h-full">
          <NavbarMenuToggle />
        </li>
      </NavbarContent>

      <div className="flex items-center gap-2">
        <KunTopBarBrand />

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
      </div>

      <KunTopBarUser />

      <KunMobileMenu items={items} />
    </Navbar>
  )
}
