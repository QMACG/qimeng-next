'use server'

import { cookies } from 'next/headers'

export const getNSFWHeader = async () => {
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
