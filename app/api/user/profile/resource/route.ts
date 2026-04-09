import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { getUserInfoSchema } from '~/validations/user'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import type { UserResource } from '~/types/api/user'

const getUserPatchResource = async (
  input: z.infer<typeof getUserInfoSchema>,
  nsfwEnable: Record<string, string | undefined>
) => {
  const { uid, page, limit } = input
  const offset = (page - 1) * limit

  const [data, total] = await Promise.all([
    prisma.patch_resource.findMany({
      where: { user_id: uid, patch: nsfwEnable, status: 0 },
      include: {
        patch: true
      },
      orderBy: { created: 'desc' },
      skip: offset,
      take: limit
    }),
    prisma.patch_resource.count({
      where: { user_id: uid, patch: nsfwEnable, status: 0 }
    })
  ])

  const resources: UserResource[] = data.map((resource) => ({
    id: resource.id,
    patchUniqueId: resource.patch.unique_id,
    patchId: resource.patch.id,
    patchName: resource.patch.name,
    patchBanner: resource.patch.banner,
    size: '',
    type: [],
    language: [],
    platform: [],
    created: String(resource.created)
  }))

  return { resources, total }
}

export async function GET(req: NextRequest) {
  const input = kunParseGetQuery(req, getUserInfoSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户登录失效')
  }
  const nsfwEnable = await getNSFWHeader(req)

  const response = await getUserPatchResource(input, nsfwEnable)
  return NextResponse.json(response)
}

