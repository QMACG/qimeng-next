'use server'

import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>

const forwardedCookieNames = new Set([
  'kun-galgame-patch-moe-token',
  'kun-patch-setting-store|state|data|kunNsfwEnable'
])

const buildRequest = async (
  pathname: string,
  query?: Record<string, QueryValue>
) => {
  const url = new URL(pathname, 'http://localhost')

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item))
        }
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .filter((cookie) => forwardedCookieNames.has(cookie.name))
    .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
    .join('; ')

  return new NextRequest(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined
  })
}

export const callRouteGet = async <T = any>(
  handler: (req: NextRequest) => Promise<Response>,
  pathname: string,
  query?: Record<string, QueryValue>
) => {
  const req = await buildRequest(pathname, query)
  const response = await handler(req)
  return (await response.json()) as T
}

export const callRouteGetWithParams = async <
  T = any,
  P = Record<string, string>
>(
  handler: (
    req: NextRequest,
    context: { params: Promise<P> }
  ) => Promise<Response>,
  pathname: string,
  params: P,
  query?: Record<string, QueryValue>
) => {
  const req = await buildRequest(pathname, query)
  const response = await handler(req, { params: Promise.resolve(params) })
  return (await response.json()) as T
}
