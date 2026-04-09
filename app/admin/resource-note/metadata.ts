import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `${kunMoyuMoe.titleShort} 后台的资源备注管理页面。`

export const kunMetadata: Metadata = {
  title: `备注管理 - ${kunMoyuMoe.titleShort}`,
  description,
  openGraph: {
    title: `备注管理 - ${kunMoyuMoe.titleShort}`,
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: `备注管理 - ${kunMoyuMoe.titleShort}`,
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/admin/resource-note`
  },
  robots: {
    index: false,
    follow: true
  }
}
