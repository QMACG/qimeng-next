import type { AdminFrontDisplayConfig } from '~/types/api/admin'
import type { Prisma } from '~/prisma/generated/prisma/client'
import { parseJsonStringArray } from '~/utils/prismaJson'
import { shouldBlurRestrictedCoverForGuest } from '~/utils/frontDisplay'

interface PatchCardRecord {
  id: number
  unique_id: string
  name: string
  banner: string
  content_limit: string
  view: number
  download: number
  type: Prisma.JsonValue | null
  language: Prisma.JsonValue | null
  platform: Prisma.JsonValue | null
  created: Date
  tag: { tag: { name: string } }[]
  _count: {
    favorite_folder: number
    resource: number
    comment: number
  }
  rating_stat: {
    avg_overall: number | null
  } | null
}

export const mapPatchRecordToGalgameCard = (
  patch: PatchCardRecord,
  uid: number,
  config: AdminFrontDisplayConfig,
  showViewCount: boolean,
  showDownloadCount: boolean
): GalgameCard => ({
  id: patch.id,
  uniqueId: patch.unique_id,
  name: patch.name,
  banner: patch.banner,
  contentLimit: patch.content_limit,
  view: showViewCount ? patch.view : 0,
  download: showDownloadCount ? patch.download : 0,
  showViewCount,
  showDownloadCount,
  shouldBlurForGuest: shouldBlurRestrictedCoverForGuest(
    uid,
    patch.content_limit,
    config
  ),
  type: parseJsonStringArray(patch.type),
  language: parseJsonStringArray(patch.language),
  platform: parseJsonStringArray(patch.platform),
  tags: patch.tag.map((item) => item.tag.name).slice(0, 3),
  created: patch.created,
  _count: patch._count,
  averageRating: patch.rating_stat?.avg_overall
    ? Math.round(patch.rating_stat.avg_overall * 10) / 10
    : 0
})
