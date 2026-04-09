import { z } from 'zod'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { hashPassword } from '~/app/api/utils/algorithm'
import { verifyVerificationCode } from '~/app/api/utils/verifyVerificationCode'
import { getRemoteIp } from '~/app/api/utils/getRemoteIp'
import { generateKunToken } from '~/app/api/utils/jwt'
import { registerSchema } from '~/validations/auth'
import { prisma } from '~/prisma/index'
import { getRedirectConfig } from '~/app/api/admin/setting/redirect/getRedirectConfig'
import { getKv } from '~/lib/redis'
import { KUN_PATCH_DISABLE_REGISTER_KEY } from '~/config/redis'
import { toJsonStringArray } from '~/utils/prismaJson'
import type { UserState } from '~/store/userStore'

const register = async (
  input: z.infer<typeof registerSchema>,
  ip: string
) => {
  const { name, email, code, password } = input

  const isCodeValid = await verifyVerificationCode(email, code)
  if (!isCodeValid) {
    return '验证码无效，请重新输入'
  }

  const existingUserCount = await prisma.user.count()
  const isBootstrapRegistration = existingUserCount === 0

  if (!isBootstrapRegistration) {
    const isDisableRegister = await getKv(KUN_PATCH_DISABLE_REGISTER_KEY)
    if (isDisableRegister) {
      return '当前站点暂未开放新用户注册'
    }
  }

  const normalizedName = name.toLowerCase()
  const sameUsernameUser = await prisma.user.findFirst({
    where: { name: { equals: normalizedName } }
  })
  if (sameUsernameUser) {
    return '该用户名已被注册，请更换后重试'
  }

  const normalizedEmail = email.toLowerCase()
  const sameEmailUser = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail } }
  })
  if (sameEmailUser) {
    return '该邮箱已被注册，请更换后重试'
  }

  const hashedPassword = await hashPassword(password)
  const role = isBootstrapRegistration ? 4 : 1

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ip,
      role,
      two_factor_backup: toJsonStringArray([])
    }
  })

  if (isBootstrapRegistration) {
    await prisma.admin_log.create({
      data: {
        type: 'bootstrap',
        user_id: user.id,
        content: `初始化超级管理员账号: ${user.name} (${user.id})`
      }
    })
  }

  const token = await generateKunToken(user.id, name, user.role, '30d')
  const cookie = await cookies()
  cookie.set('kun-galgame-patch-moe-token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  })

  const redirectConfig = await getRedirectConfig()
  const responseData: UserState = {
    uid: user.id,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    moemoepoint: user.moemoepoint,
    role: user.role,
    dailyCheckIn: user.daily_check_in,
    dailyImageLimit: user.daily_image_count,
    dailyUploadLimit: user.daily_upload_size,
    enableEmailNotice: user.enable_email_notice,
    ...redirectConfig
  }
  return responseData
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, registerSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  if (
    !req.headers ||
    (!req.headers.get('x-forwarded-for') &&
      !req.headers.get('x-real-ip') &&
      !req.headers.get('CF-Connecting-IP'))
  ) {
    return NextResponse.json('读取请求头失败')
  }

  const ip = getRemoteIp(req.headers)
  const response = await register(input, ip)
  return NextResponse.json(response)
}

