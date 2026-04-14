import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '~/prisma/generated/prisma/client'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { createFriendLinkApplySchema } from '~/validations/friend-link'
import { normalizeFriendLinkUrl } from '~/utils/friendLink'
import { FRIEND_LINK_STATUS } from '~/constants/friend-link'
import { mapFriendLink } from '~/app/api/admin/friend-link/_shared'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'

const getUniqueMessage = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }

  if (error.code !== 'P2002') {
    return null
  }

  return '该网址已存在或已提交过申请，请勿重复提交'
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, createFriendLinkApplySchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const frontDisplay = await getFrontDisplayConfig()
  if (!frontDisplay.enableFriendLinkApply) {
    return NextResponse.json('本站当前未开放友链申请')
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('请先登录后再提交友链申请')
  }

  try {
    const friendLink = await prisma.site_friend_link.create({
      data: {
        name: input.name,
        avatar: input.avatar,
        description: input.description,
        link: normalizeFriendLinkUrl(input.link),
        status: FRIEND_LINK_STATUS.pending,
        sort_order: 0,
        applicant_user_id: payload.uid
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(mapFriendLink(friendLink))
  } catch (error) {
    const message = getUniqueMessage(error)
    if (message) {
      return NextResponse.json(message)
    }

    throw error
  }
}
