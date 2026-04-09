import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `${kunMoyuMoe.titleShort} 游戏排行榜，按评分、热度与下载等维度浏览热门作品。`

export const kunMetadata: Metadata = {
  title: `游戏排行 - ${kunMoyuMoe.titleShort}`,
  description,
  openGraph: {
    title: `游戏排行 - ${kunMoyuMoe.titleShort}`,
    description,
    url: `${kunMoyuMoe.domain.main}/ranking`,
    siteName: kunMoyuMoe.title,
    images: [
      {
        url: kunMoyuMoe.og.image,
        width: 1920,
        height: 1080,
        alt: `${kunMoyuMoe.titleShort} 游戏排行`
      }
    ],
    locale: 'zh_CN',
    type: 'website'
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/ranking`,
    languages: {
      'zh-Hans': `${kunMoyuMoe.domain.main}/ranking`
    }
  }
}
