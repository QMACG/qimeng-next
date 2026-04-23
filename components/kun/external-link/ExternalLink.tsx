'use client'

import type { ReactNode } from 'react'
import type { LinkProps } from '@heroui/react'
import { Link } from '@heroui/link'
import { useUserStore } from '~/store/userStore'

interface Props extends LinkProps {
  link: string
  isRequireRedirect?: boolean
  children?: ReactNode
  showAnchorIcon?: boolean
}

export const KunExternalLink = ({
  link,
  children,
  isRequireRedirect,
  showAnchorIcon = true,
  ...props
}: Props) => {
  const encodeLink = encodeURIComponent(link)
  const userConfig = useUserStore((state) => state.user)
  const publicSiteDomains = [
    process.env.NEXT_PUBLIC_KUN_VISUAL_NOVEL_SITE_URL,
    ...(process.env.NEXT_PUBLIC_KUN_VISUAL_NOVEL_SITE_URLS?.split(',') ?? [])
  ]
    .map((domain) => domain?.trim())
    .filter((domain): domain is string => Boolean(domain))
    .map((domain) => domain.replace(/\/+$/, ''))
  const currentOrigin =
    typeof window === 'undefined'
      ? ''
      : window.location.origin.replace(/\/+$/, '')
  const siteDomains = Array.from(
    new Set([currentOrigin, ...publicSiteDomains])
  ).filter(Boolean)

  const isInternalLink =
    /^(\/(?!\/)|#|mailto:|tel:)/i.test(link) ||
    siteDomains.some((domain) => link.startsWith(domain))

  const isExcludedDomain = userConfig.excludedDomains?.some((domain) =>
    link.includes(domain)
  )

  const shouldRedirect = isInternalLink
    ? false
    : isExcludedDomain
      ? false
      : typeof isRequireRedirect === 'boolean'
        ? isRequireRedirect
        : true

  return (
    <Link
      isExternal={
        !shouldRedirect && !isInternalLink && /^https?:\/\//i.test(link)
      }
      showAnchorIcon={showAnchorIcon}
      href={shouldRedirect ? `/redirect?url=${encodeLink}` : link}
      {...props}
    >
      {children}
    </Link>
  )
}
