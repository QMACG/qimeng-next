import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { getKv, setKv } from '~/lib/redis'
import { PATCH_CACHE_DURATION } from '~/config/cache'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import {
  canAccessRestrictedContent,
  isDirectVisibleVisibility
} from '~/utils/contentVisibility'
import { canShowDownloadCount, canShowViewCount } from '~/utils/frontDisplay'
import { roundOneDecimal } from '~/utils/rating/average'
import {
  getCachedPatchFavoriteStatus,
  getPatchCacheKey,
  setCachedPatchFavoriteStatus
} from './cache'
import { parseJsonStringArray } from '~/utils/prismaJson'
import type { Patch } from '~/types/api/patch'

type CachedPatch = Omit<Patch, 'isFavorite'>

const uniqueIdSchema = z.object({
  uniqueId: z.string().min(8).max(8)
})

const getPatchFavoriteStatus = async (
  uniqueId: string,
  patchId: number,
  uid: number
) => {
  if (uid <= 0) {
    return false
  }

  const cachedFavoriteStatus = await getCachedPatchFavoriteStatus(uniqueId, uid)
  if (cachedFavoriteStatus !== null) {
    return cachedFavoriteStatus
  }

  const relation = await prisma.user_patch_favorite_folder_relation.findFirst({
    where: {
      patch_id: patchId,
      folder: {
        user_id: uid
      }
    },
    select: {
      id: true
    }
  })

  const isFavorite = Boolean(relation)
  await setCachedPatchFavoriteStatus(uniqueId, uid, isFavorite)

  return isFavorite
}

export const getPatchById = async (
  input: z.infer<typeof uniqueIdSchema>,
  uid: number,
  role = 0
) => {
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showViewCount = canShowViewCount(role, frontDisplayConfig)
  const showDownloadCount = canShowDownloadCount(role, frontDisplayConfig)
  const cachedPatch = await getKv(getPatchCacheKey(input.uniqueId))
  if (cachedPatch) {
    const patch = JSON.parse(cachedPatch) as CachedPatch
    if (isDirectVisibleVisibility(patch.status)) {
      return {
        ...patch,
        view: showViewCount ? patch.view : 0,
        download: showDownloadCount ? patch.download : 0,
        showViewCount,
        showDownloadCount,
        isFavorite: await getPatchFavoriteStatus(input.uniqueId, patch.id, uid)
      }
    }
  }

  const { uniqueId } = input

  const patch = await prisma.patch.findUnique({
    where: { unique_id: uniqueId },
    include: {
      user: true,
      tag: {
        select: {
          tag: {
            select: { name: true }
          }
        }
      },
      _count: {
        select: {
          favorite_folder: true,
          resource: true,
          comment: true
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

  const stat = await prisma.patch_rating_stat.findUnique({
    where: { patch_id: patch.id }
  })

  const response: CachedPatch = {
    id: patch.id,
    uniqueId: patch.unique_id,
    name: patch.name,
    introduction: patch.introduction,
    banner: patch.banner,
    status: patch.visibility,
    view: showViewCount ? patch.view : 0,
    download: showDownloadCount ? patch.download : 0,
    showViewCount,
    showDownloadCount,
    type: parseJsonStringArray(patch.type),
    language: parseJsonStringArray(patch.language),
    platform: parseJsonStringArray(patch.platform),
    tags: patch.tag.map((item) => item.tag.name),
    contentLimit: patch.content_limit,
    ratingSummary: stat
      ? {
          average: roundOneDecimal(stat.avg_overall),
          count: stat.count,
          histogram: [
            { score: 1, count: stat.o1 },
            { score: 2, count: stat.o2 },
            { score: 3, count: stat.o3 },
            { score: 4, count: stat.o4 },
            { score: 5, count: stat.o5 },
            { score: 6, count: stat.o6 },
            { score: 7, count: stat.o7 },
            { score: 8, count: stat.o8 },
            { score: 9, count: stat.o9 },
            { score: 10, count: stat.o10 }
          ],
          recommend: {
            strong_no: stat.rec_strong_no,
            no: stat.rec_no,
            neutral: stat.rec_neutral,
            yes: stat.rec_yes,
            strong_yes: stat.rec_strong_yes
          }
        }
      : {
          average: 0,
          count: 0,
          histogram: Array.from({ length: 10 }, (_, i) => ({
            score: i + 1,
            count: 0
          })),
          recommend: {
            strong_no: 0,
            no: 0,
            neutral: 0,
            yes: 0,
            strong_yes: 0
          }
        },
    user: {
      id: patch.user.id,
      name: patch.user.name,
      avatar: patch.user.avatar
    },
    created: String(patch.created),
    updated: String(patch.updated),
    _count: patch._count
  }

  if (isDirectVisibleVisibility(patch.visibility)) {
    await setKv(
      getPatchCacheKey(input.uniqueId),
      JSON.stringify(response),
      PATCH_CACHE_DURATION
    )
  }

  return {
    ...response,
    isFavorite: await getPatchFavoriteStatus(input.uniqueId, patch.id, uid)
  }
}
