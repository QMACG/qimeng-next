import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'

const description = `通过邮箱验证码重置 ${kunMoyuMoe.titleShort} 账户密码。`

export const kunMetadata: Metadata = {
  title: `找回密码 - ${kunMoyuMoe.titleShort}`,
  description,
  openGraph: {
    title: `找回密码 - ${kunMoyuMoe.titleShort}`,
    description,
    type: 'website',
    images: kunMoyuMoe.images
  },
  twitter: {
    card: 'summary_large_image',
    title: `找回密码 - ${kunMoyuMoe.titleShort}`,
    description
  },
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/auth/forgot`
  }
}
