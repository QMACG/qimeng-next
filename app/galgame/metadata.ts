import { kunMoyuMoe } from '~/config/moyu-moe'
import { toCanonicalUrl } from '~/utils/seo'
import type { Metadata } from 'next'

const title = `游戏列表 - ${kunMoyuMoe.titleShort}`
const description = `${kunMoyuMoe.titleShort} 的游戏列表页，可浏览封面、介绍、标签与下载资源。`

export const kunMetadata: Metadata = {
  metadataBase: new URL(kunMoyuMoe.domain.main),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    url: toCanonicalUrl('/galgame'),
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: kunMoyuMoe.og.image
  },
  alternates: {
    canonical: toCanonicalUrl('/galgame')
  }
}
