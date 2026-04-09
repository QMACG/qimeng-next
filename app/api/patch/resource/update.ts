import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { patchResourceUpdateSchema } from '~/validations/patch'
import { recalcPatchType } from './_helper'
import type { PatchResource } from '~/types/api/patch'

export const updatePatchResource = async (
  input: z.infer<typeof patchResourceUpdateSchema>,
  uid: number,
  userRole: number
) => {
  const { resourceId, patchId, storage, section, content, name } = input
  const resource = await prisma.patch_resource.findUnique({
    where: { id: resourceId }
  })
  if (!resource) {
    return '未找到该资源'
  }

  const resourceUserUid = resource.user_id
  if (resource.user_id !== uid && userRole < 2) {
    return '您没有权限修改该资源'
  }

  const currentPatch = await prisma.patch.findUnique({
    where: { id: patchId },
    select: { unique_id: true }
  })
  if (!currentPatch) {
    return '未找到该资源对应的游戏'
  }

  return prisma.$transaction(async (prisma) => {
    const newResource = await prisma.patch_resource.update({
      where: { id: resourceId, user_id: resourceUserUid },
      data: {
        name,
        storage,
        section,
        content
      },
      include: {
        user: {
          include: {
            _count: {
              select: { patch_resource: true }
            }
          }
        },
        patch: {
          select: {
            unique_id: true
          }
        }
      }
    })

    await prisma.patch.update({
      where: { id: patchId },
      data: { resource_update_time: new Date() }
    })
    await recalcPatchType(patchId, prisma)

    const resourceResponse: PatchResource = {
      id: newResource.id,
      name: newResource.name,
      section: newResource.section,
      uniqueId: newResource.patch.unique_id,
      storage: newResource.storage,
      size: '',
      type: [],
      language: [],
      note: '',
      hash: '',
      content: newResource.content,
      code: '',
      password: '',
      platform: [],
      likeCount: 0,
      isLike: false,
      status: newResource.status,
      userId: newResource.user_id,
      patchId: newResource.patch_id,
      created: String(newResource.created),
      user: {
        id: newResource.user.id,
        name: newResource.user.name,
        avatar: newResource.user.avatar,
        patchCount: newResource.user._count.patch_resource,
        role: newResource.user.role,
        showContributionStats: true
      }
    }

    return resourceResponse
  })
}
