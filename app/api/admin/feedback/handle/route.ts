import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { FEEDBACK_DOC_SLUG } from '~/constants/feedback'
import {
  FEEDBACK_COMMENT_STATUS,
  FEEDBACK_COMMENT_STATUS_VALUE_MAP
} from '~/constants/feedbackComment'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { adminHandleFeedbackCommentSchema } from '~/validations/docComment'

const handleFeedback = async (
  input: {
    commentId: number
    status: 'in_progress' | 'resolved' | 'suspended' | 'closed'
    content: string
  },
  uid: number,
  userAgent: string
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
    return '鏈壘鍒板搴旂殑鍙嶉璇勮'
  }

  const nextStatus = FEEDBACK_COMMENT_STATUS_VALUE_MAP[input.status]
  const normalizedContent = input.content.trim()

  await prisma.$transaction(async (tx) => {
    if (normalizedContent) {
      await tx.doc_post_comment.create({
        data: {
          content: normalizedContent,
          status: FEEDBACK_COMMENT_STATUS.pending,
          user_id: uid,
          doc_post_id: rootComment.doc_post_id,
          parent_id: rootComment.id,
          user_agent: userAgent
        }
      })
    }

    await tx.doc_post_comment.update({
      where: { id: rootComment.id },
      data: { status: nextStatus }
    })
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
    return NextResponse.json('鐢ㄦ埛鏈櫥褰?')
  }
  if (payload.role < 3) {
    return NextResponse.json('褰撳墠椤甸潰浠呯鐞嗗憳鍙闂?')
  }

  const response = await handleFeedback(
    input,
    payload.uid,
    req.headers.get('user-agent') ?? ''
  )
  return NextResponse.json(response)
}
