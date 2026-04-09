import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `查看 ${kunMoyuMoe.titleShort} 的站内通知、系统消息、关注动态与私聊会话。`

export const kunMetadata: Metadata = {
  title: '站内消息',
  description,
  openGraph: {
    title: '站内消息',
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '站内消息',
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/message`
  }
}
