import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { searchSchema } from '~/validations/search'
import { GalgameCardSelectField } from '~/constants/api/select'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import type { SearchResponse, SearchSuggestionType } from '~/types/api/search'
import { buildGalgameOrderBy, buildGalgameWhere } from '../utils/galgameQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { canShowDownloadCount, canShowViewCount } from '~/utils/frontDisplay'
import { parseJsonStringArray } from '~/utils/prismaJson'

const searchGalgame = async (
  input: z.infer<typeof searchSchema>,
  nsfwEnable: Record<string, string | undefined>,
  role = 0
) => {
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showViewCount = canShowViewCount(role, frontDisplayConfig)
  const showDownloadCount = canShowDownloadCount(role, frontDisplayConfig)
  const { queryString, limit, searchOption, page, sortField, sortOrder } = input
  const offset = (page - 1) * limit

  const query = JSON.parse(queryString) as SearchSuggestionType[]

  const queryArray = query
    .filter((item) => item.type === 'keyword')
    .map((item) => item.name)
  const tagArray = query
    .filter((item) => item.type === 'tag')
    .map((item) => item.name)

  const where = buildGalgameWhere({
    nsfwEnable
  })
  const unrestrictedWhere = buildGalgameWhere({
    nsfwEnable: {}
  })
  const orderBy = buildGalgameOrderBy(sortField, sortOrder)

  const baseQueryCondition = [
    ...queryArray.map((q) => ({
      OR: [
        { name: { contains: q } },
        ...(searchOption.searchInIntroduction
          ? [{ introduction: { contains: q } }]
          : []),
        ...(searchOption.searchInTag
          ? [
              {
                tag: {
                  some: {
                    tag: { name: { contains: q } }
                  }
                }
              }
            ]
          : [])
      ]
    })),

    ...tagArray.map((q) => ({
      tag: {
        some: {
          tag: {
            OR: [{ name: q }, { alias: { array_contains: [q] } }]
          }
        }
      }
    }))
  ]

  const [data, total, unrestrictedTotal] = await Promise.all([
    prisma.patch.findMany({
      take: limit,
      skip: offset,
      orderBy,
      where: { AND: baseQueryCondition, ...where },
      select: GalgameCardSelectField
    }),
    prisma.patch.count({
      where: { AND: baseQueryCondition, ...where }
    }),
    prisma.patch.count({
      where: { AND: baseQueryCondition, ...unrestrictedWhere }
    })
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

  return {
    galgames,
    total,
    hiddenCount: Math.max(0, unrestrictedTotal - total)
  } satisfies SearchResponse
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, searchSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const nsfwEnable = await getNSFWHeader(req)
  const payload = await verifyHeaderCookie(req)

  const response = await searchGalgame(input, nsfwEnable, payload?.role ?? 0)
  return NextResponse.json(response)
}
