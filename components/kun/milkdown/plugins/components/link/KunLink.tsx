'use client'

import { Card, CardBody, Chip } from '@heroui/react'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { isValidURL } from '~/utils/validate'

interface KunLinkProps {
  href: string
  text: string
  targetBlank?: boolean
}

export const KunLink = ({ href, text, targetBlank = false }: KunLinkProps) => {
  const domain = isValidURL(href) ? new URL(href).hostname : href

  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex items-center gap-2">
          <Chip size="sm" color="primary" variant="flat">
            链接
          </Chip>
          <span className="text-default-500">{domain}</span>
        </div>
        <p style={{ margin: '0' }}>{text}</p>
        <KunExternalLink
          link={href}
          target={targetBlank ? '_blank' : undefined}
          rel={targetBlank ? 'noopener noreferrer' : undefined}
        >
          {href}
        </KunExternalLink>
      </CardBody>
    </Card>
  )
}
