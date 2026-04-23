import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { sendVerificationCodeEmail } from '~/app/api/utils/sendVerificationCodeEmail'
import { sendRegisterEmailVerificationCodeSchema } from '~/validations/auth'
import { checkKunCaptchaExist } from '~/app/api/utils/verifyKunCaptcha'
import { prisma } from '~/prisma/index'
import { getKv } from '~/lib/redis'
import { KUN_PATCH_DISABLE_REGISTER_KEY } from '~/config/redis'

const sendRegisterCode = async (
  input: z.infer<typeof sendRegisterEmailVerificationCodeSchema>,
  headers: Headers
) => {
  const isCaptchaValid = await checkKunCaptchaExist(input.captcha)
  if (!isCaptchaValid) {
    return '人机验证无效，请重新完成验证'
  }

  const userCount = await prisma.user.count()
  const isBootstrapRegistration = userCount === 0
  const isDisableRegister = await getKv(KUN_PATCH_DISABLE_REGISTER_KEY)
  if (isDisableRegister && !isBootstrapRegistration) {
    return '当前站点暂未开放新用户注册'
  }

  const normalizedName = input.name.toLowerCase()
  const sameUsernameUser = await prisma.user.findFirst({
    where: { name: { equals: normalizedName } }
  })
  if (sameUsernameUser) {
    return '该用户名已被注册，请更换后重试'
  }

  const normalizedEmail = input.email.toLowerCase()
  const sameEmailUser = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail } }
  })
  if (sameEmailUser) {
    return '该邮箱已被注册，请更换后重试'
  }

  const result = await sendVerificationCodeEmail(
    headers,
    input.email,
    'register'
  )
  if (result) {
    return result
  }

  return {}
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(
    req,
    sendRegisterEmailVerificationCodeSchema
  )
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  if (!req.headers || !req.headers.get('x-forwarded-for')) {
    return NextResponse.json('读取请求头失败')
  }

  const response = await sendRegisterCode(input, req.headers)
  return NextResponse.json(response)
}
