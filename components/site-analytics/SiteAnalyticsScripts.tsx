'use client'

import { useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import type { AdminSiteAnalyticsScript } from '~/types/api/admin'
import { parseAnalyticsScriptContent } from '~/utils/siteAnalytics'

interface Props {
  scripts: AdminSiteAnalyticsScript[]
}

const DATASET_ATTR = 'data-qimeng-site-analytics'

const normalizeScriptProps = (attrs: Record<string, string | boolean>) => {
  const props: Record<string, string | boolean> = {}

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'async' || key === 'defer') {
      props[key] = Boolean(value)
      continue
    }

    if (key === 'crossorigin') {
      props.crossOrigin = String(value)
      continue
    }

    if (key === 'referrerpolicy') {
      props.referrerPolicy = String(value)
      continue
    }

    props[key] = value
  }

  return props
}

const removeInjectedScripts = () => {
  document
    .querySelectorAll(`script[${DATASET_ATTR}="true"]`)
    .forEach((node) => {
      node.remove()
    })
}

export const SiteAnalyticsScripts = ({ scripts }: Props) => {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')

  const parsedScripts = useMemo(
    () =>
      scripts.flatMap((item) =>
        parseAnalyticsScriptContent(item.content).map((script, index) => ({
          key: `${item.id}-${index}`,
          position: item.position,
          attrs: normalizeScriptProps(script.attrs),
          content: script.content
        }))
      ),
    [scripts]
  )

  useEffect(() => {
    removeInjectedScripts()

    if (isAdminPage || !parsedScripts.length) {
      return
    }

    const createdNodes: HTMLScriptElement[] = []

    for (const item of parsedScripts) {
      const script = document.createElement('script')
      script.setAttribute(DATASET_ATTR, 'true')

      for (const [key, value] of Object.entries(item.attrs)) {
        if (typeof value === 'boolean') {
          if (value) {
            script.setAttribute(key, '')
          }
        } else {
          script.setAttribute(key, value)
        }
      }

      if (typeof item.attrs.src !== 'string') {
        script.text = item.content
      }

      const target = item.position === 'head' ? document.head : document.body
      target.appendChild(script)
      createdNodes.push(script)
    }

    return () => {
      createdNodes.forEach((node) => node.remove())
    }
  }, [isAdminPage, parsedScripts])

  return null
}
