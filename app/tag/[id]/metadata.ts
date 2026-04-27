import { kunMoyuMoe } from '~/config/moyu-moe'
import { toCanonicalUrl } from '~/utils/seo'
import type { Metadata } from 'next'

export const generateKunMetadataTemplate = (
  tagName: string,
  tagId: number
): Metadata => {
  const title = `${tagName} - 游戏标签 - ${kunMoyuMoe.titleShort}`
  const description = `查看 ${tagName} 标签下的 Galgame 收录、资源与相关作品列表。`
  const canonical = toCanonicalUrl(`/tag/${tagId}`)

  return {
    metadataBase: new URL(kunMoyuMoe.domain.main),
    title,
    description,
    keywords: [tagName, 'Galgame 标签', ...kunMoyuMoe.keywords],
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: kunMoyuMoe.images
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: kunMoyuMoe.og.image
    },
    alternates: {
      canonical
    }
  }
}
