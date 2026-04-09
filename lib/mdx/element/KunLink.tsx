import Link from 'next/link'
import React, { FC } from 'react'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'

interface CustomLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

export const KunLink: FC<CustomLinkProps> = ({ href, children, ...props }) => {
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <KunExternalLink
      link={href}
      showAnchorIcon={false}
      className={props.className}
      title={props.title}
      aria-label={props['aria-label']}
    >
      {children}
    </KunExternalLink>
  )
}
