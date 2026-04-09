import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { FEEDBACK_DOC_SLUG } from '~/constants/feedback'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { adminHandleFeedbackCommentSchema } from '~/validations/docComment'

const handleFeedback = async (
  input: { commentId: number; content: string },
  uid: number
) => {
  const rootComment = await prisma.doc_post_comment.findUnique({
    where: { id: input.commentId },
    include: {
      doc_post: {
        select: {
          slug: true
        }
      }
    }
  })

  if (
    !rootComment ||
    rootComment.parent_id !== null ||
    rootComment.doc_post.slug !== FEEDBACK_DOC_SLUG
  ) {
    return '未找到对应的反馈评论'
  }

  await prisma.$transaction(async (tx) => {
    await tx.doc_post_comment.update({
      where: { id: rootComment.id },
      data: { status: 1 }
    })

    if (input.content.trim()) {
      await tx.doc_post_comment.create({
        data: {
          content: input.content.trim(),
          user_id: uid,
          doc_post_id: rootComment.doc_post_id,
          parent_id: rootComment.id
        }
      })
    }
  })

  return {}
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, adminHandleFeedbackCommentSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('当前页面仅管理员可访问')
  }

  const response = await handleFeedback(input, payload.uid)
  return NextResponse.json(response)
}
