import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { deleteResource } from '../resource/delete'

const userIdSchema = z.object({
  uid: z.coerce.number({ message: '用户 ID 必须为数字' }).min(1).max(9999999)
})

export const deleteUser = async (
  input: z.infer<typeof userIdSchema>,
  uid: number
) => {
  const user = await prisma.user.findUnique({
    where: { id: input.uid }
  })
  if (!user) {
    return '未找到用户'
  }
  if (input.uid === uid) {
    return '不能删除当前登录账号'
  }

  const admin = await prisma.user.findUnique({
    where: { id: uid }
  })
  if (!admin) {
    return '未找到当前管理员'
  }

  if (user.role === 4) {
    const superAdminCount = await prisma.user.count({
      where: { role: 4 }
    })
    if (superAdminCount <= 1) {
      return '至少保留一个超级管理员账号'
    }
  }

  const patchResources = await prisma.patch_resource.findMany({
    where: { user_id: input.uid },
    select: { id: true }
  })
  const resourceIds = patchResources.map((resource) => resource.id)

  return prisma.$transaction(
    async (tx) => {
      if (resourceIds.length) {
        for (const resourceId of resourceIds) {
          await deleteResource({ resourceId }, uid)
        }
      }

      await tx.user.delete({
        where: { id: input.uid }
      })

      await tx.admin_log.create({
        data: {
          type: 'delete',
          user_id: uid,
          content: `管理员 ${admin.name} 删除了用户\n\n${JSON.stringify(user)}`
        }
      })

      return {}
    },
    { timeout: 60000 }
  )
}
