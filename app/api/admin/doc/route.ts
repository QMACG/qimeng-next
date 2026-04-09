import { Prisma } from '~/prisma/generated/prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import {
  kunParseDeleteQuery,
  kunParseGetQuery,
  kunParsePostBody,
  kunParsePutBody
} from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import {
  adminDocCreateSchema,
  adminDocDeleteSchema,
  adminDocPaginationSchema,
  adminDocUpdateSchema
} from '~/validations/admin'
import type { AdminDocPost } from '~/types/api/admin'

const normalizeDocPath = (value: string) =>
  value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\/{2,}/g, '/')
    .toLowerCase()

const inferDocCategory = (slug: string, fallback = 'article') =>
  normalizeDocPath(slug).split('/')[0] || fallback

const mapDocPost = (post: {
  id: number
  slug: string
  title: string
  banner: string
  directory_label: string
  description: string
  content: string
  category: string
  visibility: number
  pin: boolean
  sort_order: number
  published_at: Date
  author_name: string
  author_avatar: string
  author_homepage: string
  author_id: number | null
  created: Date
  updated: Date
}): AdminDocPost => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  banner: post.banner,
  directoryLabel: post.directory_label,
  description: post.description,
  content: post.content,
  category: post.category,
  status: post.visibility,
  pin: post.pin,
  sortOrder: post.sort_order,
  publishedAt: String(post.published_at),
  authorName: post.author_name,
  authorAvatar: post.author_avatar,
  authorHomepage: post.author_homepage,
  authorId: post.author_id,
  created: String(post.created),
  updated: String(post.updated)
})

const getUniqueConstraintMessage = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null
  }

  if (error.code !== 'P2002') {
    return null
  }

  return '该文章路径已存在，请更换路径'
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, adminDocPaginationSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 2) {
    return NextResponse.json('仅编辑及以上角色可以访问后台文章管理')
  }

  const { page, limit, search, category } = input
  const offset = (page - 1) * limit
  const where = {
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { slug: { contains: search } },
            { directory_label: { contains: search } },
            { category: { contains: search } },
            { description: { contains: search } }
          ]
        }
      : {})
  }

  const [data, total] = await Promise.all([
    prisma.doc_post.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: [
        { pin: 'desc' },
        { sort_order: 'desc' },
        { published_at: 'desc' }
      ]
    }),
    prisma.doc_post.count({ where })
  ])

  return NextResponse.json({
    posts: data.map(mapDocPost),
    total
  })
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, adminDocCreateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 2) {
    return NextResponse.json('仅编辑及以上角色可以创建文章')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.uid } })
  if (!user) {
    return NextResponse.json('未找到当前用户')
  }

  try {
    const normalizedSlug = normalizeDocPath(input.slug)
    const normalizedCategory = inferDocCategory(normalizedSlug, input.category)

    const created = await prisma.doc_post.create({
      data: {
        slug: normalizedSlug,
        title: input.title,
        banner: input.banner,
        directory_label: input.directoryLabel.trim(),
        description: input.description,
        content: input.content,
        category: normalizedCategory,
        visibility: input.status,
        pin: input.pin,
        sort_order: input.sortOrder,
        published_at: new Date(input.publishedAt),
        author_id: user.id,
        author_name: user.name,
        author_avatar: user.avatar,
        author_homepage: `/user/${user.id}/comment`
      }
    })

    return NextResponse.json(mapDocPost(created))
  } catch (error) {
    const message = getUniqueConstraintMessage(error)
    if (message) {
      return NextResponse.json(message)
    }

    throw error
  }
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, adminDocUpdateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 2) {
    return NextResponse.json('仅编辑及以上角色可以修改文章')
  }

  try {
    const normalizedSlug = normalizeDocPath(input.slug)
    const normalizedCategory = inferDocCategory(normalizedSlug, input.category)

    const updated = await prisma.doc_post.update({
      where: { id: input.id },
      data: {
        slug: normalizedSlug,
        title: input.title,
        banner: input.banner,
        directory_label: input.directoryLabel.trim(),
        description: input.description,
        content: input.content,
        category: normalizedCategory,
        visibility: input.status,
        pin: input.pin,
        sort_order: input.sortOrder,
        published_at: new Date(input.publishedAt)
      }
    })

    return NextResponse.json(mapDocPost(updated))
  } catch (error) {
    const message = getUniqueConstraintMessage(error)
    if (message) {
      return NextResponse.json(message)
    }

    throw error
  }
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, adminDocDeleteSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 2) {
    return NextResponse.json('仅编辑及以上角色可以删除文章')
  }

  await prisma.doc_post.delete({
    where: { id: input.id }
  })

  return NextResponse.json({})
}
