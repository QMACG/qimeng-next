import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { createConversationSchema } from '~/validations/conversation'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'

const MOEMOEPOINT_REQUIRED = 20
const MOEMOEPOINT_COST = 10

const checkConversation = async (
  input: z.infer<typeof createConversationSchema>,
  uid: number,
  role: number
) => {
  const { targetUserId } = input

  if (targetUserId === uid) {
    return { error: '不能和自己创建会话' }
  }

  const [currentUser, targetUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: uid },
      select: { moemoepoint: true }
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true }
    })
  ])

  if (!currentUser) {
    return { error: '用户不存在' }
  }
  if (!targetUser) {
    return { error: '目标用户不存在' }
  }

  const [userAId, userBId] =
    uid < targetUserId ? [uid, targetUserId] : [targetUserId, uid]

  const conversation = await prisma.user_conversation.findUnique({
    where: {
      user_a_id_user_b_id: { user_a_id: userAId, user_b_id: userBId }
    }
  })

  if (conversation) {
    return {
      exists: true,
      conversationId: conversation.id,
      needsPayment: false,
      targetUserName: targetUser.name
    }
  }

  const isPrivileged = role > 2
  const hasEnoughPoints = currentUser.moemoepoint >= MOEMOEPOINT_REQUIRED

  if (!isPrivileged && !hasEnoughPoints) {
    return {
      error: `萌萌点不足，发起私聊需要至少 ${MOEMOEPOINT_REQUIRED} 萌萌点`
    }
  }

  return {
    exists: false,
    needsPayment: !isPrivileged,
    cost: MOEMOEPOINT_COST,
    currentPoints: currentUser.moemoepoint,
    targetUserName: targetUser.name
  }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, createConversationSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await checkConversation(input, payload.uid, payload.role)
  return NextResponse.json(response)
}
