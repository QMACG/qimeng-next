import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { markdownToHtml } from '~/app/api/utils/render/markdownToHtml'
import { FEEDBACK_DOC_PATH, FEEDBACK_DOC_SLUG } from '~/constants/feedback'
import { FEEDBACK_COMMENT_STATUS_VALUE_MAP } from '~/constants/feedbackComment'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import type { AdminFeedback } from '~/types/api/admin'
import { parseUserAgentSummary } from '~/utils/userAgentSummary'
import { adminFeedbackPaginationSchema } from '~/validations/admin'

const mapAdminFeedback = async (comment: {
  id: number
  doc_post_id: number
  parent_id: number | null
  content: string
  status: number
  user_agent: string
  created: Date
  updated: Date
  user: {
    id: number
    name: string
    avatar: string
    role: number
  }
  reply: Array<{
    id: number
    doc_post_id: number
    parent_id: number | null
    content: string
    status: number
    user_agent: string
    created: Date
    updated: Date
    user: {
      id: number
      name: string
      avatar: string
      role: number
    }
  }>
}): Promise<AdminFeedback> => ({
  id: comment.id,
  docPostId: comment.doc_post_id,
  parentId: comment.parent_id,
  content: await markdownToHtml(comment.content),
  rawContent: comment.content,
  status: comment.status,
  created: String(comment.created),
  updated: String(comment.updated),
  user: comment.user,
  sender: comment.user,
  clientInfo: parseUserAgentSummary(comment.user_agent),
  link: `${FEEDBACK_DOC_PATH}#feedback-comment-${comment.id}`,
  reply: await Promise.all(
    comment.reply.map(async (item) => ({
      id: item.id,
      docPostId: item.doc_post_id,
      parentId: item.parent_id,
      content: await markdownToHtml(item.content),
      rawContent: item.content,
      status: item.status,
      created: String(item.created),
      updated: String(item.updated),
      user: item.user,
      clientInfo: parseUserAgentSummary(item.user_agent),
      reply: []
    }))
  )
})

const getFeedback = async (
  input: z.infer<typeof adminFeedbackPaginationSchema>
) => {
  const feedbackDoc = await prisma.doc_post.findUnique({
    where: { slug: FEEDBACK_DOC_SLUG },
    select: { id: true }
  })

  if (!feedbackDoc) {
    return { feedbacks: [], total: 0 }
  }

  const { page, limit, search, searchType, status } = input
  const offset = (page - 1) * limit
  const normalizedSearch = search?.trim()

  const where = {
    doc_post_id: feedbackDoc.id,
    parent_id: null,
    ...(status !== 'all'
      ? { status: FEEDBACK_COMMENT_STATUS_VALUE_MAP[status] }
      : {}),
    ...(normalizedSearch
      ? searchType === 'user'
        ? {
            user: {
              name: {
                contains: normalizedSearch
              }
            }
          }
        : {
            content: {
              contains: normalizedSearch
            }
          }
      : {})
  }

  const [data, total] = await Promise.all([
    prisma.doc_post_comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        reply: {
          orderBy: { created: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: [{ status: 'asc' }, { created: 'desc' }],
      skip: offset,
      take: limit
    }),
    prisma.doc_post_comment.count({ where })
  ])

  const feedbacks = await Promise.all(data.map(mapAdminFeedback))
  return { feedbacks, total }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, adminFeedbackPaginationSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('鐢ㄦ埛鏈櫥褰?')
  }
  if (payload.role < 3) {
    return NextResponse.json('褰撳墠椤甸潰浠呯鐞嗗憳鍙闂?')
  }

  const response = await getFeedback(input)
  return NextResponse.json(response)
}
