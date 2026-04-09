import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getPatchByCompanySchema } from '~/validations/company'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { GalgameCardSelectField } from '~/constants/api/select'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import { buildGalgameOrderBy, buildGalgameWhere } from '~/app/api/utils/galgameQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { canShowDownloadCount, canShowViewCount } from '~/utils/frontDisplay'
import { parseJsonStringArray } from '~/utils/prismaJson'

const getPatchByCompany = async (
  input: z.infer<typeof getPatchByCompanySchema>,
  nsfwEnable: Record<string, string | undefined>,
  role = 0
) => {
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showViewCount = canShowViewCount(role, frontDisplayConfig)
  const showDownloadCount = canShowDownloadCount(role, frontDisplayConfig)
  const { companyId, page, limit, sortField, sortOrder } = input
  const offset = (page - 1) * limit
  const orderBy = buildGalgameOrderBy(sortField, sortOrder)
  const where = {
    company: {
      some: {
        company_id: companyId
      }
    },
    ...buildGalgameWhere({
      nsfwEnable
    })
  }

  const [data, total] = await Promise.all([
    prisma.patch.findMany({
      where,
      select: GalgameCardSelectField,
      orderBy,
      take: limit,
      skip: offset
    }),
    prisma.patch.count({
      where
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
    tags: gal.tag.map((tag) => tag.tag.name).slice(0, 3),
    uniqueId: gal.unique_id,
    averageRating: gal.rating_stat?.avg_overall
      ? Math.round(gal.rating_stat.avg_overall * 10) / 10
      : 0
  }))

  return { galgames, total }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, getPatchByCompanySchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const nsfwEnable = await getNSFWHeader(req)
  const payload = await verifyHeaderCookie(req)

  const response = await getPatchByCompany(input, nsfwEnable, payload?.role ?? 0)
  return NextResponse.json(response)
}
