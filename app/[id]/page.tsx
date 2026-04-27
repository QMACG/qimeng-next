import { PatchHeaderContainer } from '~/components/patch/header/Container'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { NsfwBlockedNotice } from '~/components/patch/header/NsfwBlockedNotice'
import { NsfwGuestConfirmNotice } from '~/components/patch/header/NsfwGuestConfirmNotice'
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
  kunGetRelatedPatchCardsActions,
  kunGetPatchIntroductionActions,
  kunUpdatePatchViewsActions
} from './actions'
import { getNSFWHeader } from '~/utils/actions/getNSFWHeader'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { headers } from 'next/headers'
import { isIndexingCrawlerUserAgent } from '~/utils/crawler'
import type { Metadata } from 'next'
import type { Company } from '~/types/api/company'

export const revalidate = 3

interface Props {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
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

export default async function Kun({ params, searchParams }: Props) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}

  if (!id) {
    return <ErrorComponent error="提取页面参数错误" />
  }

  const [patch, payload, nsfwHeader, frontDisplay, requestHeaders] =
    await Promise.all([
      kunGetPatchActions({ uniqueId: id }),
      verifyHeaderCookie(),
      getNSFWHeader(),
      getFrontDisplayConfig(),
      headers()
    ])

  if (typeof patch === 'string') {
    return <ErrorComponent error={patch} />
  }

  const isIndexingCrawler = isIndexingCrawlerUserAgent(
    requestHeaders.get('user-agent')
  )
  const nsfwPreference = nsfwHeader.content_limit
  const isNsfwEnabled =
    nsfwPreference === 'nsfw' || nsfwPreference === 'all' || !nsfwPreference
  const guestConfirmed =
    resolvedSearchParams.confirm === '1' ||
    (Array.isArray(resolvedSearchParams.confirm) &&
      resolvedSearchParams.confirm.includes('1'))
  const isGuestRestrictedPatch =
    patch.contentLimit === 'nsfw' &&
    !payload?.uid &&
    !frontDisplay.enableContentScopeControl
  const canViewCurrentPatch =
    patch.contentLimit !== 'nsfw' ||
    isIndexingCrawler ||
    (Boolean(payload?.uid) && isNsfwEnabled) ||
    (isGuestRestrictedPatch && guestConfirmed)

  if (!canViewCurrentPatch) {
    if (isGuestRestrictedPatch) {
      return (
        <NsfwGuestConfirmNotice continueHref={`/${patch.uniqueId}?confirm=1`} />
      )
    }

    return <NsfwBlockedNotice isLoggedIn={Boolean(payload?.uid)} />
  }

  const intro = await kunGetPatchIntroductionActions({ uniqueId: id })
  if (typeof intro === 'string') {
    return <ErrorComponent error={intro} />
  }

  const relatedPatches = frontDisplay.enablePatchRelatedGames
    ? await kunGetRelatedPatchCardsActions(
        { uniqueId: id },
        nsfwHeader,
        payload?.uid ?? 0,
        payload?.role ?? 0
      )
    : []

  if (typeof relatedPatches === 'string') {
    return <ErrorComponent error={relatedPatches} />
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

  if (!isIndexingCrawler) {
    await kunUpdatePatchViewsActions({ uniqueId: id })
  }

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
      <PatchHeaderContainer
        patch={patch}
        intro={intro}
        relatedPatches={relatedPatches}
        showRelatedGames={frontDisplay.enablePatchRelatedGames}
        uid={payload?.uid}
      />
    </div>
  )
}
