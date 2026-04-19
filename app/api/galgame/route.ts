import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '../utils/parseQuery'
import { prisma } from '~/prisma/index'
import { galgameSchema } from '~/validations/galgame'
import { GalgameCardSelectField } from '~/constants/api/select'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import { buildGalgameOrderBy, buildGalgameWhere } from '../utils/galgameQuery'
import {
  canShowDownloadCount,
  canShowViewCount,
  resolvePublicNsfwFilter
} from '~/utils/frontDisplay'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { mapPatchRecordToGalgameCard } from '~/utils/patchCard'

const getGalgame = async (
  input: z.infer<typeof galgameSchema>,
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
  const { sortField, sortOrder, page, limit } = input

  const offset = (page - 1) * limit
  const baseWhere = buildGalgameWhere({
    nsfwEnable: {}
  })
  const where = {
    ...baseWhere,
    ...effectiveNsfwFilter
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
    effectiveNsfwFilter.content_limit === 'sfw'
      ? prisma.patch.count({
          where: {
            ...baseWhere,
            content_limit: 'nsfw'
          }
        })
      : Promise.resolve(0)
  ])

  const galgames: GalgameCard[] = data.map((gal) =>
    mapPatchRecordToGalgameCard(
      gal,
      uid,
      frontDisplayConfig,
      showViewCount,
      showDownloadCount
    )
  )

  return { galgames, total, nsfwHiddenCount }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, galgameSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const nsfwEnable = await getNSFWHeader(req)
  const payload = await verifyHeaderCookie(req)
  const response = await getGalgame(
    input,
    nsfwEnable,
    payload?.uid ?? 0,
    payload?.role ?? 0
  )
  return NextResponse.json(response)
}
