import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `查看您关注的用户在 ${kunMoyuMoe.titleShort} 中产生的最新动态。`

export const kunMetadata: Metadata = {
  title: '关注消息',
  description,
  openGraph: {
    title: '关注消息',
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '关注消息',
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/message/follow`
  }
}
