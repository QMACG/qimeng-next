import type { AdminSiteAnalyticsScript } from '~/types/api/admin'

type ParsedAnalyticsScriptTag = {
  attrs: Record<string, string | boolean>
  content: string
}

const SCRIPT_TAG_REGEX = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
const ATTRIBUTE_REGEX =
  /([:@A-Za-z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

const parseScriptAttributes = (raw: string) => {
  const attrs: Record<string, string | boolean> = {}
  let match: RegExpExecArray | null

  while ((match = ATTRIBUTE_REGEX.exec(raw))) {
    const key = match[1]
    const value = match[2] ?? match[3] ?? match[4]
    attrs[key] = value ?? true
  }

  return attrs
}

export const parseAnalyticsScriptContent = (content: string) => {
  const scripts: ParsedAnalyticsScriptTag[] = []
  let match: RegExpExecArray | null

  while ((match = SCRIPT_TAG_REGEX.exec(content))) {
    scripts.push({
      attrs: parseScriptAttributes(match[1] ?? ''),
      content: (match[2] ?? '').trim()
    })
  }

  if (!scripts.length && content.trim()) {
    scripts.push({
      attrs: {},
      content: content.trim()
    })
  }

  return scripts
}

export const splitSiteAnalyticsScriptsByPosition = (
  items: AdminSiteAnalyticsScript[]
) => {
  const head = items.filter((item) => item.position === 'head')
  const bodyEnd = items.filter((item) => item.position === 'body_end')

  return {
    head,
    bodyEnd
  }
}
