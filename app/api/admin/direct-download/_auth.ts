import { NextRequest } from 'next/server'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'

export const verifyDirectDownloadAdmin = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)

  if (!payload) {
    return '用户未登录'
  }

  if (payload.role < 3) {
    return '仅管理员可以管理直链下载'
  }

  return payload
}
