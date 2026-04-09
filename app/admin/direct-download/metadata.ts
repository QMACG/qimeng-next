import type { Metadata } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'

const description = `${kunMoyuMoe.titleShort} 后台的直链下载管理页面。`

export const metadata: Metadata = {
  title: `直链管理 - ${kunMoyuMoe.titleShort}`,
  description,
  openGraph: {
    title: `直链管理 - ${kunMoyuMoe.titleShort}`,
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: `直链管理 - ${kunMoyuMoe.titleShort}`,
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/admin/direct-download`
  },
  robots: {
    index: false,
    follow: true
  }
}
