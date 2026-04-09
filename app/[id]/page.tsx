import { PatchHeaderContainer } from '~/components/patch/header/Container'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { NsfwBlockedNotice } from '~/components/patch/header/NsfwBlockedNotice'
import { generateKunMetadataTemplate } from './metadata'
import { kunMoyuMoe } from '~/config/moyu-moe'
import {
  buildBreadcrumbJsonLd,
  htmlToSeoDescription,
  serializeJsonLd,
  toCanonicalUrl
} from '~/utils/seo'
import {
  kunGetPatchActions,
  kunGetPatchIntroductionActions,
  kunUpdatePatchViewsActions
} from './actions'
import { getNSFWHeader } from '~/utils/actions/getNSFWHeader'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import type { Metadata } from 'next'
import type { Company } from '~/types/api/company'

export const revalidate = 3

interface Props {
  params: Promise<{ id: string }>
}

export const generateMetadata = async ({
  params
}: Props): Promise<Metadata> => {
  const { id } = await params
  const patch = await kunGetPatchActions({
    uniqueId: id
  })
  const intro = await kunGetPatchIntroductionActions({ uniqueId: id })
  if (typeof patch === 'string' || typeof intro === 'string') {
    return {}
  }

  return generateKunMetadataTemplate(patch, intro)
}

export default async function Kun({ params }: Props) {
  const { id } = await params
  if (!id) {
    return <ErrorComponent error={'提取页面参数错误'} />
  }

  const [patch, payload, nsfwHeader] = await Promise.all([
    kunGetPatchActions({ uniqueId: id }),
    verifyHeaderCookie(),
    getNSFWHeader()
  ])
  if (typeof patch === 'string') {
    return <ErrorComponent error={patch} />
  }

  const nsfwPreference = nsfwHeader.content_limit
  const isNsfwEnabled =
    nsfwPreference === 'nsfw' || nsfwPreference === 'all' || !nsfwPreference
  const canViewCurrentPatch =
    patch.contentLimit !== 'nsfw' || (Boolean(payload?.uid) && isNsfwEnabled)

  if (!canViewCurrentPatch) {
    return <NsfwBlockedNotice isLoggedIn={Boolean(payload?.uid)} />
  }

  const intro = await kunGetPatchIntroductionActions({ uniqueId: id })
  if (typeof intro === 'string') {
    return <ErrorComponent error={intro} />
  }

  const canonical = toCanonicalUrl(`/${patch.uniqueId}`)
  const description = htmlToSeoDescription(
    intro.introduction,
    `${kunMoyuMoe.titleShort} 提供 ${patch.name} 的游戏介绍、资源信息、标签与评论内容。`
  )
  const videoGameJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: patch.name,
    url: canonical,
    image: patch.banner,
    description,
    genre: patch.tags,
    gamePlatform: patch.platform,
    inLanguage: patch.language,
    publisher: intro.company.map((company: Company) => ({
      '@type': 'Organization',
      name: company.name
    })),
    aggregateRating:
      patch.ratingSummary.count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: patch.ratingSummary.average,
            ratingCount: patch.ratingSummary.count,
            bestRating: 10,
            worstRating: 1
          }
        : undefined
  }
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: kunMoyuMoe.titleShort, item: toCanonicalUrl('/') },
    { name: '游戏列表', item: toCanonicalUrl('/galgame') },
    { name: patch.name, item: canonical }
  ])

  await kunUpdatePatchViewsActions({ uniqueId: id })

  return (
    <div className="container py-6 mx-auto space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(videoGameJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <PatchHeaderContainer patch={patch} intro={intro} uid={payload?.uid} />
    </div>
  )
}
