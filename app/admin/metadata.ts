import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `${kunMoyuMoe.titleShort} 后台管理入口。`

export const kunMetadata: Metadata = {
  title: '后台管理',
  description,
  openGraph: {
    title: '后台管理',
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '后台管理',
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/admin`
  }
}
