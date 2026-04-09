import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `登录 ${kunMoyuMoe.titleShort}，继续浏览游戏文章、查看资源链接、发表评论与管理站内内容。`

export const kunMetadata: Metadata = {
  title: `登录 - ${kunMoyuMoe.titleShort}`,
  description,
  keywords: ['登录', '账户登录', '用户认证', '绮梦登录', '游戏资源'],
  openGraph: {
    title: `登录 - ${kunMoyuMoe.titleShort}`,
    description,
    url: `${kunMoyuMoe.domain.main}/login`,
    siteName: kunMoyuMoe.title,
    images: [
      {
        url: kunMoyuMoe.og.image,
        width: 1920,
        height: 1080,
        alt: `登录 - ${kunMoyuMoe.titleShort}`
      }
    ],
    locale: 'zh_CN',
    type: 'website'
  },
  verification: {
    google: 'google-site-verification-code'
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/login`,
    languages: {
      'zh-Hans': `${kunMoyuMoe.domain.main}/login`
    }
  }
}
