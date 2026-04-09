import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'

export const metadata: Metadata = {
  title: `直链下载 - ${kunMoyuMoe.titleShort}`,
  description: `${kunMoyuMoe.titleShort} 的直链下载确认页面`,
  robots: {
    index: false,
    follow: false
  },
  referrer: 'no-referrer'
}
