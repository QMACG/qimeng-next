import { kunMoyuMoe } from '~/config/moyu-moe'
import { toCanonicalUrl } from '~/utils/seo'
import type { Metadata } from 'next'

const title = `游戏标签 - ${kunMoyuMoe.titleShort}`
const description = `${kunMoyuMoe.titleShort} 的游戏标签索引，可按主题、会社、属性与类型浏览已收录的 Galgame。`

export const kunMetadata: Metadata = {
  metadataBase: new URL(kunMoyuMoe.domain.main),
  title,
  description,
  keywords: ['Galgame 标签', '游戏标签', ...kunMoyuMoe.keywords],
  openGraph: {
    title,
    description,
    type: 'website',
    url: toCanonicalUrl('/tag'),
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: kunMoyuMoe.og.image
  },
  alternates: {
    canonical: toCanonicalUrl('/tag')
  }
}
