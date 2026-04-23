const CODE_BLOCK_REGEX = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g
const BUTTON_TAG_REGEX =
  /\{button(?<attrs>[^}]*)\}(?<text>[\s\S]*?)\{\/button\}/gi
const CALLOUT_BLOCK_REGEX =
  /:::\s*callout(?:\{(?<attrs>[^\n}]*)\})?\s*\n(?<content>[\s\S]*?)\n:::/gi
const GALLERY_BLOCK_REGEX = /:::\s*gallery\s*\n(?<content>[\s\S]*?)\n:::/gi

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escapeAttribute = (value: string) =>
  escapeHtml(value).replace(/"/g, '&quot;')

const parseAttributes = (rawAttrs: string) => {
  const attributes: Record<string, string> = {}
  const attrRegex = /(\w+)=("([^"]*)"|'([^']*)')/g

  for (const match of rawAttrs.matchAll(attrRegex)) {
    const key = match[1]
    const value = match[3] ?? match[4] ?? ''
    attributes[key] = value
  }

  return attributes
}

const transformOutsideCodeBlocks = (
  markdown: string,
  transformer: (segment: string) => string
) =>
  markdown
    .split(CODE_BLOCK_REGEX)
    .map((segment, index) => (index % 2 === 0 ? transformer(segment) : segment))
    .join('')

const transformButtonSyntax = (
  markdown: string,
  renderer: (input: { href: string; type: string; text: string }) => string
) =>
  markdown.replace(BUTTON_TAG_REGEX, (_, rawAttrs = '', rawText = '') => {
    const attributes = parseAttributes(rawAttrs)
    const href = (attributes.href ?? '').trim()
    const type = (attributes.type ?? 'primary').trim() || 'primary'
    const text = rawText.trim() || '按钮'

    return renderer({ href, type, text })
  })

const transformCalloutSyntaxToMdx = (markdown: string) =>
  markdown.replace(CALLOUT_BLOCK_REGEX, (_, rawAttrs = '', rawContent = '') => {
    const attributes = parseAttributes(rawAttrs)
    const type = (attributes.type ?? 'info').trim() || 'info'
    const title = (attributes.title ?? '').trim()
    const content = rawContent.trim()

    return `<MarkdownCallout type="${escapeAttribute(type)}"${title ? ` title="${escapeAttribute(title)}"` : ''}>
${content}
</MarkdownCallout>`
  })

const transformGallerySyntaxToMdx = (markdown: string) =>
  markdown.replace(GALLERY_BLOCK_REGEX, (_, rawContent = '') => {
    const content = rawContent.trim()

    return `<MarkdownGallery>
${content}
</MarkdownGallery>`
  })

export const transformButtonSyntaxToHtml = (markdown: string) =>
  transformOutsideCodeBlocks(markdown, (segment) =>
    transformButtonSyntax(segment, ({ href, type, text }) => {
      return `<div data-kun-button="" data-href="${escapeAttribute(href)}" data-type="${escapeAttribute(type)}" data-text="${escapeAttribute(text)}"></div>`
    })
  )

export const transformMarkdownEnhancementsToMdx = (markdown: string) =>
  transformOutsideCodeBlocks(markdown, (segment) => {
    const withCallouts = transformCalloutSyntaxToMdx(segment)
    const withGallery = transformGallerySyntaxToMdx(withCallouts)

    return transformButtonSyntax(withGallery, ({ href, type, text }) => {
      return `<MarkdownButtonLink href="${escapeAttribute(href)}" type="${escapeAttribute(type)}">${escapeHtml(text)}</MarkdownButtonLink>`
    })
  })
