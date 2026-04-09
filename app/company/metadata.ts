import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'

const title = `会社索引 - ${kunMoyuMoe.titleShort}`
const description = `浏览 ${kunMoyuMoe.titleShort} 收录的会社与品牌，查看相关游戏与基础资料。`

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
    canonical: `${kunMoyuMoe.domain.main}/company`
  }
}
