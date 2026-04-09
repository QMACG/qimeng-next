import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '~/prisma/index'

interface Props {
  params: Promise<{ legacyId: string }>
}

const parseLegacyPatchId = (rawValue: string) => {
  const match = rawValue.match(/^(\d+)(?:\.html)?$/i)
  if (!match) {
    return null
  }

  const patchId = Number(match[1])
  return Number.isSafeInteger(patchId) && patchId > 0 ? patchId : null
}

const pickForwardedValue = (value: string | null) => {
  if (!value) {
    return ''
  }

  const firstValue = value
    .split(',')
    .map((item) => item.trim())
    .find(Boolean)

  return firstValue ?? ''
}

const getRequestOrigin = (req: NextRequest) => {
  const forwardedHost = pickForwardedValue(req.headers.get('x-forwarded-host'))
  const host = forwardedHost || req.headers.get('host') || req.nextUrl.host

  const forwardedProto = pickForwardedValue(req.headers.get('x-forwarded-proto'))
  const protocol = forwardedProto || req.nextUrl.protocol.replace(':', '')

  return `${protocol}://${host}`
}

const redirectLegacyPatch = async (req: NextRequest, legacyId: string) => {
  const patchId = parseLegacyPatchId(legacyId)
  if (!patchId) {
    return NextResponse.json({ message: '未找到对应游戏' }, { status: 404 })
  }

  const patch = await prisma.patch.findUnique({
    where: { id: patchId },
    select: { unique_id: true }
  })

  if (!patch) {
    return NextResponse.json({ message: '未找到对应游戏' }, { status: 404 })
  }

  const url = new URL(`/${patch.unique_id}`, getRequestOrigin(req))
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value)
  })

  return NextResponse.redirect(url, 301)
}

export async function GET(req: NextRequest, { params }: Props) {
  const { legacyId } = await params
  return redirectLegacyPatch(req, legacyId)
}

export const HEAD = GET
