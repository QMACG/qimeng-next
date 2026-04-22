import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { markdownToHtmlExtend } from '~/app/api/utils/render/markdownToHtmlExtend'
import { getKv, setKv } from '~/lib/redis'
import { PATCH_INTRODUCTION_CACHE_DURATION } from '~/config/cache'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import {
  canAccessRestrictedContent,
  isDirectVisibleVisibility
} from '~/utils/contentVisibility'
import { parseJsonStringArray } from '~/utils/prismaJson'
import type { PatchIntroduction } from '~/types/api/patch'

const CACHE_KEY = 'patch:introduction'

const uniqueIdSchema = z.object({
  uniqueId: z.string().min(8).max(8)
})

const getPatchIntroduction = async (
  input: z.infer<typeof uniqueIdSchema>,
  uid = 0,
  role = 0
) => {
  const cachedIntro = await getKv(`${CACHE_KEY}:${input.uniqueId}`)
  if (cachedIntro) {
    return JSON.parse(cachedIntro) as PatchIntroduction
  }

  const { uniqueId } = input

  const patch = await prisma.patch.findUnique({
    where: { unique_id: uniqueId },
    include: {
      tag: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              count: true,
              alias: true
            }
          }
        }
      },
      company: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              count: true,
              alias: true
            }
          }
        }
      }
    }
  })
  if (!patch) {
    return '未找到对应游戏'
  }
  if (
    !canAccessRestrictedContent({
      visibility: patch.visibility,
      authorId: patch.user_id,
      uid,
      role
    })
  ) {
    return '未找到对应游戏'
  }

  const response: PatchIntroduction = {
    introduction: await markdownToHtmlExtend(patch.introduction),
    resourceNote: patch.resource_note,
    released: patch.released,
    tag: patch.tag.map((item) => ({
      ...item.tag,
      alias: parseJsonStringArray(item.tag.alias)
    })),
    company: patch.company.map((item) => ({
      ...item.company,
      alias: parseJsonStringArray(item.company.alias)
    })),
    created: patch.published,
    updated: patch.updated,
    resourceUpdateTime: patch.resource_update_time
  }

  if (isDirectVisibleVisibility(patch.visibility)) {
    await setKv(
      `${CACHE_KEY}:${input.uniqueId}`,
      JSON.stringify(response),
      PATCH_INTRODUCTION_CACHE_DURATION
    )
  }

  return response
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, uniqueIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  const response = await getPatchIntroduction(
    input,
    payload?.uid ?? 0,
    payload?.role ?? 0
  )
  return NextResponse.json(response)
}
