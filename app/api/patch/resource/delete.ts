import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { recalcPatchType } from './_helper'

const resourceIdSchema = z.object({
  resourceId: z.coerce.number().min(1).max(9999999)
})

export const deleteResource = async (
  input: z.infer<typeof resourceIdSchema>,
  uid: number,
  userRole: number
) => {
  const patchResource = await prisma.patch_resource.findUnique({
    where: { id: input.resourceId }
  })
  if (!patchResource) {
    return '未找到对应的资源'
  }

  if (patchResource.user_id !== uid && userRole < 2) {
    return '您没有权限删除该资源'
  }

  return prisma.$transaction(async (prisma) => {
    await prisma.patch_resource.delete({
      where: { id: input.resourceId }
    })
    await recalcPatchType(patchResource.patch_id, prisma)
    return {}
  })
}
