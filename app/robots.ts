import { kunMoyuMoe } from '~/config/moyu-moe'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/message/',
          '/user/',
          '/settings/',
          '/login',
          '/register',
          '/getFile',
          '/redirect',
          '/comment',
          '/search',
          '/*?page=',
          '/*&page='
        ]
      }
    ],
    sitemap: `${kunMoyuMoe.domain.main}/sitemap.xml`,
    host: kunMoyuMoe.domain.main
  }
}
