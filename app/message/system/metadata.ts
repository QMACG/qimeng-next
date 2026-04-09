import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `查看 ${kunMoyuMoe.titleShort} 的系统消息`

export const kunMetadata: Metadata = {
  title: '系统消息',
  description,
  openGraph: {
    title: '系统消息',
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '系统消息',
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/message/system`
  }
}
