import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getPatchByTagSchema } from '~/validations/tag'
import { GalgameCardSelectField } from '~/constants/api/select'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import { buildGalgameOrderBy, buildGalgameWhere } from '~/app/api/utils/galgameQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { canShowDownloadCount, canShowViewCount } from '~/utils/frontDisplay'
import { parseJsonStringArray } from '~/utils/prismaJson'

const getPatchByTag = async (
  input: z.infer<typeof getPatchByTagSchema>,
  nsfwEnable: Record<string, string | undefined>,
  role = 0
) => {
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showViewCount = canShowViewCount(role, frontDisplayConfig)
  const showDownloadCount = canShowDownloadCount(role, frontDisplayConfig)
  const { tagId, page, limit, sortField, sortOrder } = input
  const offset = (page - 1) * limit
  const orderBy = { patch: buildGalgameOrderBy(sortField, sortOrder) }
  const basePatchWhere = buildGalgameWhere({
    nsfwEnable: {}
  })
  const patchWhere = {
    ...basePatchWhere,
    ...nsfwEnable
  }

  const [data, total, nsfwHiddenCount] = await Promise.all([
    prisma.patch_tag_relation.findMany({
      where: { tag_id: tagId, patch: patchWhere },
      select: {
        patch: {
          select: GalgameCardSelectField
        }
      },
      orderBy,
      take: limit,
      skip: offset
    }),
    prisma.patch_tag_relation.count({
      where: { tag_id: tagId, patch: patchWhere }
    }),
    nsfwEnable.content_limit === 'sfw'
      ? prisma.patch_tag_relation.count({
          where: {
            tag_id: tagId,
            patch: {
              ...basePatchWhere,
              content_limit: 'nsfw'
            }
          }
        })
      : Promise.resolve(0)
  ])

  const patches = data.map((item) => item.patch)
  const galgames: GalgameCard[] = patches.map((gal) => ({
    ...gal,
    view: showViewCount ? gal.view : 0,
    download: showDownloadCount ? gal.download : 0,
    showViewCount,
    showDownloadCount,
    type: parseJsonStringArray(gal.type),
    language: parseJsonStringArray(gal.language),
    platform: parseJsonStringArray(gal.platform),
    tags: gal.tag.map((tag) => tag.tag.name).slice(0, 3),
    uniqueId: gal.unique_id,
    averageRating: gal.rating_stat?.avg_overall
      ? Math.round(gal.rating_stat.avg_overall * 10) / 10
      : 0
  }))

  return { galgames, total, nsfwHiddenCount }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, getPatchByTagSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const nsfwEnable = await getNSFWHeader(req)
  const payload = await verifyHeaderCookie(req)

  const response = await getPatchByTag(input, nsfwEnable, payload?.role ?? 0)
  return NextResponse.json(response)
}
