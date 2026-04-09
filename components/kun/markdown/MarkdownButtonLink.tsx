import type { FC, ReactNode } from 'react'
import Link from 'next/link'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { cn } from '~/utils/cn'

interface Props {
  href: string
  type?: string
  children: ReactNode
  className?: string
  targetBlank?: boolean
}

const colorClassMap: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  blue: 'bg-primary text-primary-foreground hover:bg-primary/90',
  yellow: 'bg-warning text-warning-foreground hover:bg-warning/90',
  orange: 'bg-warning text-warning-foreground hover:bg-warning/90',
  gold: 'bg-warning text-warning-foreground hover:bg-warning/90',
  green: 'bg-success text-success-foreground hover:bg-success/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
  red: 'bg-danger text-danger-foreground hover:bg-danger/90',
  danger: 'bg-danger text-danger-foreground hover:bg-danger/90',
  purple: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  pink: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  gray: 'bg-default-200 text-default-800 hover:bg-default-300',
  white: 'bg-white text-black hover:bg-white/90',
  black: 'bg-black text-white hover:bg-black/90',
  'outline-yellow':
    'border border-warning bg-warning-50 text-warning-700 hover:bg-warning-100',
  'outline-blue':
    'border border-primary bg-primary-50 text-primary-700 hover:bg-primary-100',
  'outline-green':
    'border border-success bg-success-50 text-success-700 hover:bg-success-100',
  'outline-red':
    'border border-danger bg-danger-50 text-danger-700 hover:bg-danger-100',
  default: 'bg-default-200 text-default-800 hover:bg-default-300'
}

const getButtonClassName = (type?: string) => {
  const normalizedType = type?.trim().toLowerCase() ?? 'primary'
  return colorClassMap[normalizedType] ?? colorClassMap.primary
}

const baseClassName =
  'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold no-underline transition-colors'

export const MarkdownButtonLink: FC<Props> = ({
  href,
  type = 'primary',
  children,
  className,
  targetBlank = false
}) => {
  const resolvedClassName = cn(
    baseClassName,
    getButtonClassName(type),
    className
  )

  if (href.startsWith('/')) {
    return (
      <Link
        href={href}
        className={resolvedClassName}
        target={targetBlank ? '_blank' : undefined}
        rel={targetBlank ? 'noopener noreferrer' : undefined}
      >
        {children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        className={resolvedClassName}
        target={targetBlank ? '_blank' : undefined}
        rel={targetBlank ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    )
  }

  return (
    <KunExternalLink
      link={href}
      showAnchorIcon={false}
      className={resolvedClassName}
      target={targetBlank ? '_blank' : undefined}
      rel={targetBlank ? 'noopener noreferrer' : undefined}
    >
      {children}
    </KunExternalLink>
  )
}
