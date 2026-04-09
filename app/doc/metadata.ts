import { kunMoyuMoe } from '~/config/moyu-moe'
import { toCanonicalUrl } from '~/utils/seo'
import type { Metadata } from 'next'

const title = `文章 - ${kunMoyuMoe.titleShort}`
const description = `${kunMoyuMoe.titleShort} 的文章列表，可查看帮助文档、公告与独立文章内容。`

export const kunMetadata: Metadata = {
  metadataBase: new URL(kunMoyuMoe.domain.main),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    url: toCanonicalUrl('/doc'),
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: kunMoyuMoe.og.image
  },
  alternates: {
    canonical: toCanonicalUrl('/doc')
  }
}
