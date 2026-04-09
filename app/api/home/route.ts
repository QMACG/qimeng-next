import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '~/prisma/index'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import { GalgameCardSelectField } from '~/constants/api/select'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { canShowDownloadCount, canShowViewCount } from '~/utils/frontDisplay'
import { parseJsonStringArray } from '~/utils/prismaJson'

const getHomeData = async (
  nsfwEnable: Record<string, string | undefined>,
  role = 0
) => {
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showViewCount = canShowViewCount(role, frontDisplayConfig)
  const showDownloadCount = canShowDownloadCount(role, frontDisplayConfig)
  const where = {
    visibility: CONTENT_VISIBILITY.public,
    ...nsfwEnable
  }

  const [data, nsfwHiddenCount] = await Promise.all([
    prisma.patch.findMany({
      orderBy: { created: 'desc' },
      where,
      select: GalgameCardSelectField,
      take: 20
    }),
    nsfwEnable.content_limit === 'sfw'
      ? prisma.patch.count({
          where: {
            visibility: CONTENT_VISIBILITY.public,
            content_limit: 'nsfw'
          }
        })
      : Promise.resolve(0)
  ])

  const galgames: GalgameCard[] = data.map((gal) => ({
    ...gal,
    view: showViewCount ? gal.view : 0,
    download: showDownloadCount ? gal.download : 0,
    showViewCount,
    showDownloadCount,
    type: parseJsonStringArray(gal.type),
    language: parseJsonStringArray(gal.language),
    platform: parseJsonStringArray(gal.platform),
    tags: gal.tag.map((t) => t.tag.name).slice(0, 3),
    uniqueId: gal.unique_id,
    averageRating: gal.rating_stat?.avg_overall
      ? Math.round(gal.rating_stat.avg_overall * 10) / 10
      : 0
  }))

  return { galgames, nsfwHiddenCount }
}

export const GET = async (req: NextRequest) => {
  const nsfwEnable = await getNSFWHeader(req)
  const payload = await verifyHeaderCookie(req)

  const response = await getHomeData(nsfwEnable, payload?.role ?? 0)
  return NextResponse.json(response)
}
