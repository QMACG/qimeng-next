import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { usernameSchema } from '~/validations/user'
import { auditTextContent } from '~/utils/contentAudit'

const updateUsername = async (username: string, uid: number) => {
  const user = await prisma.user.findUnique({ where: { id: uid } })
  if (!user) {
    return '用户未找到'
  }
  if (user.moemoepoint < 30) {
    return '更改用户名最少需要 30 萌萌点，您当前的萌萌点不足'
  }

  const auditError = await auditTextContent({
    content: username,
    scenario: 'username',
    identity: {
      uid,
      username
    }
  })
  if (auditError) {
    return auditError
  }

  const normalizedName = username.toLowerCase()
  const sameUsernameUser = await prisma.user.findFirst({
    where: { name: { equals: normalizedName } }
  })
  if (sameUsernameUser) {
    return '这个用户名已经被其他用户使用了，请更换后重试'
  }

  await prisma.user.update({
    where: { id: uid },
    data: { name: username, moemoepoint: { increment: -30 } }
  })
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, usernameSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await updateUsername(input.username, payload.uid)
  if (typeof res === 'string') {
    return NextResponse.json(res)
  }

  return NextResponse.json({})
}
