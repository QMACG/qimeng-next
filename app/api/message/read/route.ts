import { NextRequest, NextResponse } from 'next/server'
import { kunParseDeleteQuery } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { clearReadMessageSchema } from '~/validations/message'

const MESSAGE_BATCH_SIZE = 1000

const processMessageInBatches = async (
  handler: () => Promise<number>
) => {
  while (true) {
    const affectedCount = await handler()

    if (!affectedCount) {
      return
    }
  }
}

const readMessage = async (uid: number) => {
  await processMessageInBatches(async () => {
    const messages = await prisma.user_message.findMany({
      where: {
        recipient_id: uid,
        status: 0
      },
      orderBy: { id: 'asc' },
      take: MESSAGE_BATCH_SIZE,
      select: { id: true }
    })

    if (!messages.length) {
      return 0
    }

    const result = await prisma.user_message.updateMany({
      where: {
        id: {
          in: messages.map((message) => message.id)
        }
      },
      data: {
        status: 1
      }
    })

    return result.count
  })

  return {}
}

const clearReadMessage = async (uid: number, type: string) => {
  await processMessageInBatches(async () => {
    const messages = await prisma.user_message.findMany({
      where: {
        recipient_id: uid,
        status: 1,
        ...(type ? { type } : {})
      },
      orderBy: { id: 'asc' },
      take: MESSAGE_BATCH_SIZE,
      select: { id: true }
    })

    if (!messages.length) {
      return 0
    }

    const result = await prisma.user_message.deleteMany({
      where: {
        id: {
          in: messages.map((message) => message.id)
        }
      }
    })

    return result.count
  })

  return {}
}

export const PUT = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await readMessage(payload.uid)
  return NextResponse.json(response)
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, clearReadMessageSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await clearReadMessage(payload.uid, input.type)
  return NextResponse.json(response)
}

