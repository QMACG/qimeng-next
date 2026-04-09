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
  createAdvertisementSchema,
  deleteAdvertisementSchema,
  updateAdvertisementSchema
} from '~/validations/advertisement'
import { getAdminAdvertisements, mapAdvertisement } from './_shared'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import type { AdvertisementKind } from '~/types/api/advertisement'

const canManageAdvertisement = (role = 0) => role >= 2

const kindLabelMap: Record<AdvertisementKind, string> = {
  home_box: '首页广告',
  featured_post: '置顶文章广告',
  redirect_box: '跳转页广告'
}

const getAdvertisementDoc = async (docPostId: number) => {
  const docPost = await prisma.doc_post.findUnique({
    where: { id: docPostId },
    select: {
      id: true,
      title: true,
      slug: true,
      banner: true,
      description: true,
      visibility: true,
      directory_label: true,
      published_at: true,
      category: true
    }
  })

  if (!docPost) {
    return '未找到对应文章'
  }

  if (docPost.category !== 'advertisement') {
    return '只能选择 advertisement 目录下的文章'
  }

  if (docPost.visibility === CONTENT_VISIBILITY.private) {
    return '私有文章不能设置为置顶文章广告'
  }

  return docPost
}

const getUniqueMessage = (error: unknown, kind?: AdvertisementKind) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }

  if (error.code !== 'P2002') {
    return null
  }

  if (kind === 'home_box') {
    return '该首页广告位已被占用，请更换广告位后重试'
  }

  return '该广告配置已存在，请调整后重试'
}

const getDeleteErrorMessage = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }

  if (error.code === 'P2025') {
    return '广告不存在或已删除'
  }

  return null
}

const getPermissionErrorResponse = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (!canManageAdvertisement(payload.role)) {
    return NextResponse.json('仅编辑及以上角色可以管理广告')
  }

  return payload
}

export const GET = async (req: NextRequest) => {
  const payload = await getPermissionErrorResponse(req)
  if (payload instanceof NextResponse) {
    return payload
  }

  const response = await getAdminAdvertisements()
  return NextResponse.json(response)
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, createAdvertisementSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await getPermissionErrorResponse(req)
  if (payload instanceof NextResponse) {
    return payload
  }

  let title = input.title
  let banner = input.banner
  let link = input.link
  let targetMode = input.targetMode ?? 'article'
  let docPostId: number | null = null

  if (input.kind === 'featured_post' && input.targetMode === 'article') {
    const docPost = await getAdvertisementDoc(input.docPostId)
    if (typeof docPost === 'string') {
      return NextResponse.json(docPost)
    }

    title = docPost.title
    banner = docPost.banner || '/favicon.ico'
    link = `/doc/${docPost.slug}`
    docPostId = docPost.id
  }

  try {
    const advertisement = await prisma.site_advertisement.create({
      data: {
        kind: input.kind,
        title,
        banner,
        link,
        target_mode: targetMode,
        visible_for_guest: input.visibleForGuest,
        sort_order: input.sortOrder,
        slot: input.kind === 'home_box' ? input.slot : null,
        doc_post_id: docPostId
      },
      include: {
        doc_post: {
          select: {
            id: true,
            title: true,
            slug: true,
            banner: true,
            description: true,
            visibility: true,
            directory_label: true,
            published_at: true
          }
        }
      }
    })

    return NextResponse.json(mapAdvertisement(advertisement))
  } catch (error) {
    const message = getUniqueMessage(error, input.kind)
    if (message) {
      return NextResponse.json(message)
    }

    console.error(`创建${kindLabelMap[input.kind]}失败:`, error)
    return NextResponse.json(`保存${kindLabelMap[input.kind]}失败，请稍后重试`)
  }
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, updateAdvertisementSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await getPermissionErrorResponse(req)
  if (payload instanceof NextResponse) {
    return payload
  }

  const current = await prisma.site_advertisement.findUnique({
    where: { id: input.id }
  })
  if (!current) {
    return NextResponse.json('未找到对应广告')
  }

  let title = input.title
  let banner = input.banner
  let link = input.link
  let targetMode = input.targetMode ?? 'article'
  let docPostId: number | null = null

  if (input.kind === 'featured_post' && input.targetMode === 'article') {
    const docPost = await getAdvertisementDoc(input.docPostId)
    if (typeof docPost === 'string') {
      return NextResponse.json(docPost)
    }

    title = docPost.title
    banner = docPost.banner || '/favicon.ico'
    link = `/doc/${docPost.slug}`
    docPostId = docPost.id
  }

  try {
    const advertisement = await prisma.site_advertisement.update({
      where: { id: input.id },
      data: {
        kind: input.kind,
        title,
        banner,
        link,
        target_mode: targetMode,
        visible_for_guest: input.visibleForGuest,
        sort_order: input.sortOrder,
        slot: input.kind === 'home_box' ? input.slot : null,
        doc_post_id: docPostId
      },
      include: {
        doc_post: {
          select: {
            id: true,
            title: true,
            slug: true,
            banner: true,
            description: true,
            visibility: true,
            directory_label: true,
            published_at: true
          }
        }
      }
    })

    return NextResponse.json(mapAdvertisement(advertisement))
  } catch (error) {
    const message = getUniqueMessage(error, input.kind)
    if (message) {
      return NextResponse.json(message)
    }

    console.error(`更新${kindLabelMap[input.kind]}失败:`, error)
    return NextResponse.json(`保存${kindLabelMap[input.kind]}失败，请稍后重试`)
  }
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, deleteAdvertisementSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await getPermissionErrorResponse(req)
  if (payload instanceof NextResponse) {
    return payload
  }

  try {
    await prisma.site_advertisement.delete({
      where: { id: input.id }
    })
  } catch (error) {
    const message = getDeleteErrorMessage(error)
    if (message) {
      return NextResponse.json(message)
    }

    console.error('删除广告失败:', error)
    return NextResponse.json('删除广告失败，请稍后重试')
  }

  return NextResponse.json({})
}
