import { parseCookies } from '~/utils/cookies'
import type { NextRequest } from 'next/server'

export const getNSFWHeader = async (req: NextRequest) => {
  const cookies = parseCookies(req.headers.get('cookie') ?? '')
  const settingToken =
    cookies['kun-patch-setting-store|state|data|kunNsfwEnable']
  if (settingToken) {
    if (settingToken === 'all') {
      return {}
    }

    return { content_limit: settingToken }
  }

  return { content_limit: 'sfw' }
}
