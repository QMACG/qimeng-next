import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '~/prisma/index'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import { GalgameCardSelectField } from '~/constants/api/select'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import {
  canShowDownloadCount,
  canShowViewCount,
  resolvePublicNsfwFilter,
  shouldBypassGuestContentScope
} from '~/utils/frontDisplay'
import { mapPatchRecordToGalgameCard } from '~/utils/patchCard'

const HOME_PATCH_LIMIT = 20
const HOME_GUEST_NSFW_LIMIT = 6

const getHomeData = async (
  nsfwEnable: Record<string, string | undefined>,
  uid = 0,
  role = 0
) => {
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showViewCount = canShowViewCount(role, frontDisplayConfig)
  const showDownloadCount = canShowDownloadCount(role, frontDisplayConfig)
  const effectiveNsfwFilter = resolvePublicNsfwFilter(
    nsfwEnable,
    uid,
    frontDisplayConfig
  )
  const bypassGuestContentScope = shouldBypassGuestContentScope(
    uid,
    frontDisplayConfig
  )
  const where = {
    visibility: CONTENT_VISIBILITY.public,
    ...effectiveNsfwFilter
  }

  const [data, nsfwHiddenCount] = await Promise.all([
    prisma.patch.findMany({
      orderBy: { published: 'desc' },
      where,
      select: GalgameCardSelectField,
      take: bypassGuestContentScope ? 60 : HOME_PATCH_LIMIT
    }),
    effectiveNsfwFilter.content_limit === 'sfw'
      ? prisma.patch.count({
          where: {
            visibility: CONTENT_VISIBILITY.public,
            content_limit: 'nsfw'
          }
        })
      : Promise.resolve(0)
  ])

  const limitedHomeData = bypassGuestContentScope
    ? (() => {
        const selected: typeof data = []
        let nsfwCount = 0

        for (const patch of data) {
          const isNsfw = patch.content_limit === 'nsfw'
          if (isNsfw && nsfwCount >= HOME_GUEST_NSFW_LIMIT) {
            continue
          }

          selected.push(patch)
          if (isNsfw) {
            nsfwCount += 1
          }

          if (selected.length >= HOME_PATCH_LIMIT) {
            break
          }
        }

        return selected
      })()
    : data

  const galgames: GalgameCard[] = limitedHomeData.map((gal) =>
    mapPatchRecordToGalgameCard(
      gal,
      uid,
      frontDisplayConfig,
      showViewCount,
      showDownloadCount
    )
  )

  return { galgames, nsfwHiddenCount }
}

export const GET = async (req: NextRequest) => {
  const nsfwEnable = await getNSFWHeader(req)
  const payload = await verifyHeaderCookie(req)

  const response = await getHomeData(
    nsfwEnable,
    payload?.uid ?? 0,
    payload?.role ?? 0
  )
  return NextResponse.json(response)
}
