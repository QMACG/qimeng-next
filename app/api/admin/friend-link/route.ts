import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '~/prisma/generated/prisma/client'
import {
  kunParseDeleteQuery,
  kunParsePostBody,
  kunParsePutBody
} from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import {
  createFriendLinkSchema,
  deleteFriendLinkSchema,
  updateFriendLinkSchema
} from '~/validations/friend-link'
import { mapFriendLink, getAdminFriendLinks } from './_shared'
import { normalizeFriendLinkUrl } from '~/utils/friendLink'

const canManageFriendLink = (role = 0) => role >= 2

const getUniqueMessage = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }

  if (error.code !== 'P2002') {
    return null
  }

  return '该友链已存在，请检查站点名称或网址是否重复'
}

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (!canManageFriendLink(payload.role)) {
    return NextResponse.json('仅编辑及以上角色可以管理友链')
  }

  return NextResponse.json({
    links: await getAdminFriendLinks()
  })
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, createFriendLinkSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (!canManageFriendLink(payload.role)) {
    return NextResponse.json('仅编辑及以上角色可以管理友链')
  }

  try {
    const friendLink = await prisma.site_friend_link.create({
      data: {
        name: input.name,
        avatar: input.avatar,
        description: input.description,
        link: normalizeFriendLinkUrl(input.link),
        status: input.status,
        sort_order: input.sortOrder
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

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, updateFriendLinkSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (!canManageFriendLink(payload.role)) {
    return NextResponse.json('仅编辑及以上角色可以管理友链')
  }

  try {
    const friendLink = await prisma.site_friend_link.update({
      where: { id: input.id },
      data: {
        name: input.name,
        avatar: input.avatar,
        description: input.description,
        link: normalizeFriendLinkUrl(input.link),
        status: input.status,
        sort_order: input.sortOrder
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

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, deleteFriendLinkSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (!canManageFriendLink(payload.role)) {
    return NextResponse.json('仅编辑及以上角色可以管理友链')
  }

  await prisma.site_friend_link.delete({
    where: { id: input.id }
  })

  return NextResponse.json({})
}
