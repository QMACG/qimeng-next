import { convert } from 'html-to-text'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { markdownToText } from './markdownToText'

const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

export const toCanonicalUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${kunMoyuMoe.domain.main}${normalizedPath}`
}

export const htmlToSeoDescription = (
  html: string,
  fallback: string,
  maxLength = 170
) => {
  const text = collapseWhitespace(
    convert(html, {
      wordwrap: false,
      selectors: [{ selector: 'p', format: 'inline' }]
    })
  )

  return (text || fallback).slice(0, maxLength)
}

export const markdownToSeoDescription = (
  markdown: string,
  fallback: string,
  maxLength = 170
) => {
  const text = collapseWhitespace(markdownToText(markdown))
  return (text || fallback).slice(0, maxLength)
}

export const serializeJsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c')

export const buildBreadcrumbJsonLd = (
  items: Array<{
    name: string
    item: string
  }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((entry, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: entry.name,
    item: entry.item
  }))
})
