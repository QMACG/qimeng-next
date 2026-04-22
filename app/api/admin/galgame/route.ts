import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import type { AdminGalgame } from '~/types/api/admin'
import { adminGalgamePaginationSchema } from '~/validations/admin'

const statusWhereMap = {
  draft: CONTENT_VISIBILITY.draft,
  public: CONTENT_VISIBILITY.public,
  hidden: CONTENT_VISIBILITY.hidden,
  private: CONTENT_VISIBILITY.private
} as const

const getGalgame = async (
  input: z.infer<typeof adminGalgamePaginationSchema>
) => {
  const { page, limit, search, status } = input
  const offset = (page - 1) * limit
  const normalizedSearch = search?.trim()
  const searchId =
    normalizedSearch && /^\d+$/.test(normalizedSearch)
      ? Number.parseInt(normalizedSearch, 10)
      : null

  const where = {
    ...(status !== 'all'
      ? {
          visibility: statusWhereMap[status]
        }
      : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { name: { contains: normalizedSearch } },
            ...(searchId !== null ? [{ id: searchId }] : [])
          ]
        }
      : {})
  }

  const [data, total] = await Promise.all([
    prisma.patch.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { published: 'desc' },
      select: {
        id: true,
        unique_id: true,
        name: true,
        banner: true,
        visibility: true,
        published: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    }),
    prisma.patch.count({ where })
  ])

  const galgames: AdminGalgame[] = data.map((galgame) => ({
    id: galgame.id,
    uniqueId: galgame.unique_id,
    name: galgame.name,
    banner: galgame.banner,
    status: galgame.visibility,
    user: galgame.user,
    publishedAt: galgame.published
  }))

  return { galgames, total }
}

export async function GET(req: NextRequest) {
  const input = kunParseGetQuery(req, adminGalgamePaginationSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('鐢ㄦ埛鏈櫥褰?')
  }
  if (payload.role < 2) {
    return NextResponse.json(
      '浠呯紪杈戙€佺鐞嗗憳鍜岃秴绾х鐞嗗憳鍙互璁块棶鍚庡彴'
    )
  }

  const res = await getGalgame(input)
  return NextResponse.json(res)
}
