import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { recalcPatchType } from '~/app/api/patch/resource/_helper'

const resourceIdSchema = z.object({
  resourceId: z.coerce.number().min(1).max(9999999)
})

export const deleteResource = async (
  input: z.infer<typeof resourceIdSchema>,
  uid: number
) => {
  const admin = await prisma.user.findUnique({ where: { id: uid } })
  if (!admin) {
    return '管理员不存在'
  }

  const patchResource = await prisma.patch_resource.findUnique({
    where: { id: input.resourceId },
    include: {
      patch: {
        select: {
          name: true
        }
      }
    }
  })

  if (!patchResource) {
    return '资源不存在'
  }

  return prisma.$transaction(async (prisma) => {
    await prisma.patch_resource.delete({
      where: { id: input.resourceId }
    })
    await recalcPatchType(patchResource.patch_id, prisma)

    await prisma.admin_log.create({
      data: {
        type: 'delete',
        user_id: uid,
        content:
          `管理员 ${admin.name} 删除了一条资源链接\n\n` +
          `所属游戏：\n${patchResource.patch.name}\n\n` +
          `资源数据：\n${JSON.stringify(patchResource)}`
      }
    })

    return {}
  })
}
