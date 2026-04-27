import { kunMoyuMoe } from '~/config/moyu-moe'
import { htmlToSeoDescription, toCanonicalUrl } from '~/utils/seo'
import type { Metadata } from 'next'
import type { Patch, PatchIntroduction } from '~/types/api/patch'

const getPlatformDescription = (platform: string[]) => {
  const hasWindows = platform.includes('windows')
  const hasAndroid = platform.includes('android')

  if (hasWindows && hasAndroid) {
    return 'PC+安卓'
  }
  if (hasWindows) {
    return 'PC游戏'
  }
  if (hasAndroid) {
    return '安卓游戏'
  }

  return ''
}

export const generateKunMetadataTemplate = (
  patch: Patch,
  intro: PatchIntroduction
): Metadata => {
  const patchType = getPlatformDescription(patch.platform)
  const detailTitle = patchType
    ? `${patch.name} ${patchType}下载`
    : `${patch.name} 免费galgame资源下载`
  const description = htmlToSeoDescription(
    intro.introduction,
    `${kunMoyuMoe.titleShort} 提供 ${patch.name} 的游戏介绍、资源信息、标签与评论内容。`
  )
  const canonical = toCanonicalUrl(`/${patch.uniqueId}`)

  return {
    metadataBase: new URL(kunMoyuMoe.domain.main),
    title: `${detailTitle} - ${kunMoyuMoe.titleShort}`,
    keywords: [
      patch.name,
      patchType,
      ...patch.tags,
      ...kunMoyuMoe.keywords
    ].filter(Boolean),
    authors: kunMoyuMoe.author,
    creator: kunMoyuMoe.creator.name,
    publisher: kunMoyuMoe.publisher.name,
    description,
    openGraph: {
      url: canonical,
      siteName: kunMoyuMoe.titleShort,
      title: `${detailTitle} - ${kunMoyuMoe.titleShort}`,
      description,
      type: 'article',
      publishedTime: patch.created,
      modifiedTime: patch.updated,
      images: [
        {
          url: patch.banner,
          width: 1920,
          height: 1080,
          alt: patch.name
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${detailTitle} - ${kunMoyuMoe.titleShort}`,
      description,
      images: [patch.banner]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    alternates: {
      canonical
    }
  }
}
