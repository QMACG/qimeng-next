import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { canShowCreatorStats } from '~/utils/frontDisplay'
import type { FloatingCardUser } from '~/types/api/user'

const uidSchema = z.object({
  uid: z.coerce.number().min(1).max(9999999)
})

const getReceivedFavoriteCount = async (uid: number) => {
  const relations = await prisma.user_patch_favorite_folder_relation.findMany({
    where: {
      patch: {
        user_id: uid
      }
    },
    select: {
      patch_id: true,
      folder: {
        select: {
          user_id: true
        }
      }
    }
  })

  const uniqueFavorites = new Set(
    relations.map((relation) => `${relation.folder.user_id}:${relation.patch_id}`)
  )

  return uniqueFavorites.size
}

const getUserFloatingProfile = async (
  input: z.infer<typeof uidSchema>,
  currentUserUid: number,
  role = 0
) => {
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showContributionStats = canShowCreatorStats(role, frontDisplayConfig)

  const [data, receivedFavoriteCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.uid },
      include: {
        _count: {
          select: {
            follower: true,
            patch: true,
            patch_resource: true
          }
        },
        following: true
      }
    }),
    getReceivedFavoriteCount(input.uid)
  ])

  if (!data) {
    return '未找到用户'
  }

  const followerUserUid = data.following.map((f) => f.follower_id)

  const user: FloatingCardUser = {
    id: data.id,
    name: data.name,
    avatar: data.avatar,
    bio: data.bio,
    moemoepoint: data.moemoepoint,
    role: data.role,
    isFollow: followerUserUid.includes(currentUserUid),
    receivedFavoriteCount,
    showContributionStats,
    _count: {
      follower: data._count.follower,
      patch: showContributionStats ? data._count.patch : 0,
      patch_resource: showContributionStats ? data._count.patch_resource : 0
    }
  }

  return user
}

export async function GET(req: NextRequest) {
  const input = kunParseGetQuery(req, uidSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const payload = await verifyHeaderCookie(req)

  const user = await getUserFloatingProfile(
    input,
    payload?.uid ?? 0,
    payload?.role ?? 0
  )
  return NextResponse.json(user)
}
