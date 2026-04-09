import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'

export const kunMetadata: Metadata = {
  title: '友情链接',
  description: `${kunMoyuMoe.titleShort} 的友情链接页面，收录相关站点与友链申请入口。`,
  openGraph: {
    title: '友情链接',
    description: `${kunMoyuMoe.titleShort} 的友情链接页面，收录相关站点与友链申请入口。`,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: '友情链接',
    description: `${kunMoyuMoe.titleShort} 的友情链接页面，收录相关站点与友链申请入口。`,
    images: kunMoyuMoe.images
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/friend-link`
  }
}
