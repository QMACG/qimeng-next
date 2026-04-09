import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { adminPaginationSchema } from '~/validations/admin'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import type { AdminGalgame } from '~/types/api/admin'

const getGalgame = async (input: z.infer<typeof adminPaginationSchema>) => {
  const { page, limit, search } = input
  const offset = (page - 1) * limit

  const where = search
    ? {
        name: {
          contains: search
        }
      }
    : {}

  const [data, total] = await Promise.all([
    prisma.patch.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { created: 'desc' },
      include: {
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
    created: galgame.created
  }))

  return { galgames, total }
}

export async function GET(req: NextRequest) {
  const input = kunParseGetQuery(req, adminPaginationSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 2) {
    return NextResponse.json('仅编辑、管理员和超级管理员可以访问后台')
  }

  const res = await getGalgame(input)
  return NextResponse.json(res)
}
