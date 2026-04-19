import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { prisma } from '~/prisma/index'
import { avatarSchema } from '~/validations/user'
import { toSafeRemoteHttpUrl } from '~/utils/publicAsset'

const updateUserAvatar = async (uid: number, avatar: string) => {
  const user = await prisma.user.findUnique({
    where: { id: uid }
  })
  if (!user) {
    return 'User not found'
  }

  await prisma.user.update({
    where: { id: uid },
    data: { avatar }
  })

  return { avatar }
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, avatarSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const safeAvatar = toSafeRemoteHttpUrl(input.avatar)
  if (!safeAvatar) {
    return NextResponse.json('Invalid avatar URL')
  }
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('User not logged in')
  }

  const res = await updateUserAvatar(payload.uid, safeAvatar)
  return NextResponse.json(res)
}

