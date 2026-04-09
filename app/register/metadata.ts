import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `注册 ${kunMoyuMoe.titleShort} 账户，浏览游戏文章、下载资源、参与评论与评分。`

export const kunMetadata: Metadata = {
  title: `注册 - ${kunMoyuMoe.titleShort}`,
  description,
  keywords: ['注册', '创建账户', '绮梦注册', '游戏资源', '用户注册'],
  openGraph: {
    title: `注册 - ${kunMoyuMoe.titleShort}`,
    description,
    url: `${kunMoyuMoe.domain.main}/register`,
    siteName: kunMoyuMoe.title,
    images: [
      {
        url: kunMoyuMoe.og.image,
        width: 1920,
        height: 1080,
        alt: `${kunMoyuMoe.titleShort} 注册页面`
      }
    ],
    locale: 'zh_CN',
    type: 'website'
  },
  verification: {
    google: 'google-site-verification-code'
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/register`,
    languages: {
      'zh-Hans': `${kunMoyuMoe.domain.main}/register`
    }
  }
}
