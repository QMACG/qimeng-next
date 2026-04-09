import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  kunParseGetQuery,
  kunParsePostBody
} from '~/app/api/utils/parseQuery'
import { markdownToHtml } from '~/app/api/utils/render/markdownToHtml'
import { FEEDBACK_DOC_SLUG } from '~/constants/feedback'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import type { DocComment, DocCommentResponse } from '~/types/api/doc'
import {
  docCommentCreateSchema,
  getDocCommentSchema
} from '~/validations/docComment'
import { auditTextContent } from '~/utils/contentAudit'

const mapDocComment = async (
  comment: {
    id: number
    doc_post_id: number
    parent_id: number | null
    content: string
    status: number
    created: Date
    updated: Date
    user: {
      id: number
      name: string
      avatar: string
      role: number
    }
    reply?: Array<{
      id: number
      doc_post_id: number
      parent_id: number | null
      content: string
      status: number
      created: Date
      updated: Date
      user: {
        id: number
        name: string
        avatar: string
        role: number
      }
    }>
  }
): Promise<DocComment> => ({
  id: comment.id,
  docPostId: comment.doc_post_id,
  parentId: comment.parent_id,
  content: await markdownToHtml(comment.content),
  status: comment.status,
  created: String(comment.created),
  updated: String(comment.updated),
  user: comment.user,
  reply: comment.reply
    ? await Promise.all(
        comment.reply.map(async (item) => ({
          id: item.id,
          docPostId: item.doc_post_id,
          parentId: item.parent_id,
          content: await markdownToHtml(item.content),
          status: item.status,
          created: String(item.created),
          updated: String(item.updated),
          user: item.user,
          reply: []
        }))
      )
    : []
})

const getFeedbackDocPost = async (docPostId: number) => {
  const docPost = await prisma.doc_post.findUnique({
    where: { id: docPostId },
    select: {
      id: true,
      slug: true
    }
  })

  if (!docPost || docPost.slug !== FEEDBACK_DOC_SLUG) {
    return null
  }

  return docPost
}

const getDocComments = async (
  input: z.infer<typeof getDocCommentSchema>
): Promise<DocCommentResponse | string> => {
  const feedbackDoc = await getFeedbackDocPost(input.docPostId)
  if (!feedbackDoc) {
    return '未找到对应的反馈文章'
  }

  const where = {
    doc_post_id: feedbackDoc.id,
    parent_id: null
  }

  const [total, comments] = await Promise.all([
    prisma.doc_post_comment.count({ where }),
    prisma.doc_post_comment.findMany({
      where,
      orderBy: { created: 'desc' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
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
      }
    })
  ])

  return {
    comments: await Promise.all(comments.map(mapDocComment)),
    total
  }
}

const createDocComment = async (
  input: z.infer<typeof docCommentCreateSchema>,
  uid: number,
  username: string,
  role: number
): Promise<DocComment | string> => {
  const feedbackDoc = await getFeedbackDocPost(input.docPostId)
  if (!feedbackDoc) {
    return '未找到对应的反馈文章'
  }

  const auditError = await auditTextContent({
    content: input.content,
    scenario: 'comment',
    identity: {
      uid,
      username
    }
  })
  if (auditError) {
    return auditError
  }

  const parentId = input.parentId ?? null

  if (parentId !== null) {
    const parentComment = await prisma.doc_post_comment.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        doc_post_id: true,
        parent_id: true
      }
    })

    if (!parentComment || parentComment.doc_post_id !== feedbackDoc.id) {
      return '未找到要回复的评论'
    }

    if (parentComment.parent_id !== null) {
      return '暂不支持回复二级评论'
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const comment = await tx.doc_post_comment.create({
      data: {
        content: input.content.trim(),
        user_id: uid,
        doc_post_id: feedbackDoc.id,
        parent_id: parentId
      },
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
    })

    if (parentId !== null && role >= 3) {
      await tx.doc_post_comment.update({
        where: { id: parentId },
        data: { status: 1 }
      })
    }

    return comment
  })

  return mapDocComment({ ...created, reply: [] })
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, getDocCommentSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('请先登录后再查看评论')
  }

  const response = await getDocComments(input)
  return NextResponse.json(response)
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, docCommentCreateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await createDocComment(
    input,
    payload.uid,
    payload.name,
    payload.role
  )
  return NextResponse.json(response)
}
