import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { getNSFWHeader } from '~/app/api/utils/getNSFWHeader'
import { getRemoteIp } from '~/app/api/utils/getRemoteIp'
import { checkKunCaptchaExist } from '~/app/api/utils/verifyKunCaptcha'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { directDownloadPrepareSchema } from '~/validations/patch'
import { getRawDirectDownloadConfig, prepareDirectDownload } from './_shared'

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, directDownloadPrepareSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('请先登录后再下载直链资源。')
  }

  const config = await getRawDirectDownloadConfig()
  if (config.require_captcha) {
    const captchaPassed = await checkKunCaptchaExist(input.captcha)
    if (!captchaPassed) {
      return NextResponse.json('请先完成验证码验证。')
    }
  }

  try {
    const nsfwHeader = await getNSFWHeader(req)
    const response = await prepareDirectDownload({
      file: input.file,
      uid: payload.uid,
      role: payload.role,
      nsfwPreference: nsfwHeader.content_limit ?? 'all',
      userIp: getRemoteIp(req.headers),
      userAgent: req.headers.get('user-agent') ?? ''
    })

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成下载链接失败'
    return NextResponse.json(message)
  }
}
