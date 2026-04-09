import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getResourceNoteConfig } from '~/app/api/admin/setting/resource-note/getResourceNoteConfig'
import { canAccessRestrictedContent } from '~/utils/contentVisibility'
import { canShowCreatorStats } from '~/utils/frontDisplay'
import type { PatchResource, PatchResourcePayload } from '~/types/api/patch'

const patchIdSchema = z.object({
  patchId: z.coerce.number().min(1).max(9999999)
})

export const getPatchResource = async (
  input: z.infer<typeof patchIdSchema>,
  uid: number,
  role = 0
) => {
  const { patchId } = input
  const frontDisplayConfig = await getFrontDisplayConfig()
  const showContributionStats = canShowCreatorStats(role, frontDisplayConfig)

  const [resourceConfig, patch, data] = await Promise.all([
    getResourceNoteConfig(),
    prisma.patch.findUnique({
      where: { id: patchId },
      select: { resource_note: true, visibility: true, user_id: true }
    }),
    prisma.patch_resource.findMany({
      where: {
        patch_id: patchId,
        status: 0
      },
      include: {
        patch: { select: { unique_id: true } },
        user: {
          include: {
            _count: {
              select: { patch_resource: true }
            }
          }
        },
        _count: {
          select: { like_by: true }
        },
        like_by: {
          where: {
            user_id: uid
          }
        }
      }
    })
  ])

  if (
    !patch ||
    !canAccessRestrictedContent({
      visibility: patch.visibility,
      authorId: patch.user_id,
      uid,
      role
    })
  ) {
    return '未找到对应游戏'
  }

  const resources: PatchResource[] = data.map((resource) => ({
    id: resource.id,
    name: resource.name,
    section: resource.section,
    uniqueId: resource.patch.unique_id,
    storage: resource.storage,
    size: '',
    type: [],
    language: [],
    note: '',
    hash: '',
    content: resource.content,
    code: '',
    password: '',
    platform: [],
    likeCount: resource._count.like_by,
    isLike: resource.like_by.length > 0,
    status: resource.status,
    userId: resource.user_id,
    patchId: resource.patch_id,
    created: String(resource.created),
    user: {
      id: resource.user.id,
      name: resource.user.name,
      avatar: resource.user.avatar,
      patchCount: showContributionStats ? resource.user._count.patch_resource : 0,
      role: resource.user.role,
      showContributionStats
    }
  }))

  const defaultNote = resourceConfig.defaultNote.trim()
  const patchNote = patch.resource_note?.trim() ?? ''
  const noteParts = [defaultNote, patchNote].filter(
    (value, index, array) => value && array.indexOf(value) === index
  )
  const note = resourceConfig.enableNote ? noteParts.join('\n\n') : ''

  const payload: PatchResourcePayload = {
    resources,
    note
  }

  return payload
}
