import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const title = `游戏评论 - ${kunMoyuMoe.titleShort}`
const description = `${kunMoyuMoe.titleShort} 的评论页面，集中查看用户对游戏内容、下载资源与游玩体验的讨论。`

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
    canonical: `${kunMoyuMoe.domain.main}/comment`
  }
}
