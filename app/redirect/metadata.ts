import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'

const title = `外链跳转提示 - ${kunMoyuMoe.titleShort}`
const description = `${kunMoyuMoe.titleShort} 的外链安全提示页，用于在跳转第三方地址前提醒目标链接信息。`

export const metadata: Metadata = {
  metadataBase: new URL(kunMoyuMoe.domain.main),
  title,
  description,
  referrer: 'no-referrer',
  openGraph: {
    title,
    description,
    type: 'website',
    url: `${kunMoyuMoe.domain.main}/redirect`,
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/redirect`
  }
}
