import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'

const title = `搜索游戏 - ${kunMoyuMoe.titleShort}`
const description = `搜索 ${kunMoyuMoe.titleShort} 站内的游戏文章、标签、会社与相关内容。`

export const kunMetadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/search`
  }
}
