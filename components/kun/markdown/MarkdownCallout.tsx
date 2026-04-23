import { cn } from '~/utils/cn'
import type { FC, ReactNode } from 'react'

interface Props {
  type?: string
  title?: string
  children: ReactNode
}

const colorClassMap: Record<string, string> = {
  info: 'data-kun-callout-info border-blue-300/90 bg-blue-50/90 text-blue-950',
  tip: 'data-kun-callout-info border-blue-300/90 bg-blue-50/90 text-blue-950',
  warning:
    'data-kun-callout-warning border-amber-300/90 bg-amber-50/95 text-amber-950',
  caution:
    'data-kun-callout-warning border-amber-300/90 bg-amber-50/95 text-amber-950',
  success:
    'data-kun-callout-success border-green-300/90 bg-green-50/95 text-green-950',
  danger: 'data-kun-callout-danger border-red-300/90 bg-red-50/95 text-red-950',
  error: 'data-kun-callout-danger border-red-300/90 bg-red-50/95 text-red-950',
  note: 'data-kun-callout-note border-violet-300/90 bg-violet-50/95 text-violet-950'
}

export const MarkdownCallout: FC<Props> = ({
  type = 'info',
  title,
  children
}) => {
  const normalizedType = type.trim().toLowerCase()
  const className = colorClassMap[normalizedType] ?? colorClassMap.info

  return (
    <div
      className={cn('data-kun-callout rounded-2xl border px-4 py-4', className)}
    >
      {title ? (
        <div className="data-kun-callout__title mb-2 text-sm font-bold leading-6">
          {title}
        </div>
      ) : null}
      <div className="data-kun-callout__content">{children}</div>
    </div>
  )
}
