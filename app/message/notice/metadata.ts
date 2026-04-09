import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `查看 ${kunMoyuMoe.titleShort} 中与评论、点赞、提及和互动相关的通知消息。`

export const kunMetadata: Metadata = {
  title: '通知消息',
  description,
  openGraph: {
    title: '通知消息',
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '通知消息',
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/message/notice`
  }
}
