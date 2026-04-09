import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '../utils/parseQuery'
import { prisma } from '~/prisma/index'
import { galgameSchema } from '~/validations/galgame'
import { GalgameCardSelectField } from '~/constants/api/select'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import { buildGalgameOrderBy, buildGalgameWhere } from '../utils/galgameQuery'
import { parseJsonStringArray } from '~/utils/prismaJson'
import { canShowDownloadCount, canShowViewCount } from '~/utils/frontDisplay'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

const getGalgame = async (
  input: z.infer<typeof galgameSchema>,
  nsfwEnable: Record<string, string | undefined>,
  role = 0
) => {
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showViewCount = canShowViewCount(role, frontDisplayConfig)
  const showDownloadCount = canShowDownloadCount(role, frontDisplayConfig)
  const { sortField, sortOrder, page, limit } = input

  const offset = (page - 1) * limit
  const baseWhere = buildGalgameWhere({
    nsfwEnable: {}
  })
  const where = {
    ...baseWhere,
    ...nsfwEnable
  }
  const orderBy = buildGalgameOrderBy(sortField, sortOrder)

  const [data, total, nsfwHiddenCount] = await Promise.all([
    prisma.patch.findMany({
      take: limit,
      skip: offset,
      orderBy,
      where,
      select: GalgameCardSelectField
    }),
    prisma.patch.count({ where }),
    nsfwEnable.content_limit === 'sfw'
      ? prisma.patch.count({
          where: {
            ...baseWhere,
            content_limit: 'nsfw'
          }
        })
      : Promise.resolve(0)
  ])

  const galgames: GalgameCard[] = data.map((gal) => ({
    id: gal.id,
    uniqueId: gal.unique_id,
    name: gal.name,
    banner: gal.banner,
    view: showViewCount ? gal.view : 0,
    download: showDownloadCount ? gal.download : 0,
    showViewCount,
    showDownloadCount,
    type: parseJsonStringArray(gal.type),
    language: parseJsonStringArray(gal.language),
    platform: parseJsonStringArray(gal.platform),
    tags: gal.tag.map((t) => t.tag.name).slice(0, 3),
    created: gal.created,
    _count: gal._count,
    averageRating: gal.rating_stat?.avg_overall
      ? Math.round(gal.rating_stat.avg_overall * 10) / 10
      : 0
  }))

  return { galgames, total, nsfwHiddenCount }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, galgameSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const nsfwEnable = await getNSFWHeader(req)
  const payload = await verifyHeaderCookie(req)
  const response = await getGalgame(input, nsfwEnable, payload?.role ?? 0)
  return NextResponse.json(response)
}
