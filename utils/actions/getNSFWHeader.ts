'use server'

import { cookies, headers } from 'next/headers'
import { isIndexingCrawlerUserAgent } from '~/utils/crawler'

export const getNSFWHeader = async () => {
  const requestHeaders = await headers()
  if (isIndexingCrawlerUserAgent(requestHeaders.get('user-agent'))) {
    return {}
  }

  const cookieStore = await cookies()
  const settingToken = cookieStore.get(
    'kun-patch-setting-store|state|data|kunNsfwEnable'
  )?.value

  if (settingToken) {
    if (settingToken === 'all') {
      return {}
    }

    return { content_limit: settingToken }
  }

  return { content_limit: 'sfw' }
}
