import { z } from 'zod'
import { prisma } from '~/prisma/index'

const patchIdSchema = z.object({
  patchId: z.coerce.number().min(1).max(9999999)
})

export const deletePatchById = async (input: z.infer<typeof patchIdSchema>) => {
  const { patchId } = input

  const patch = await prisma.patch.findUnique({
    where: { id: patchId }
  })
  if (!patch) {
    return '未找到该游戏'
  }

  const patchResources = await prisma.patch_resource.findMany({
    where: { patch_id: patchId }
  })

  return prisma.$transaction(async (tx) => {
    if (patchResources.length > 0) {
      await Promise.all(
        patchResources.map(async (resource) => {
          await tx.patch_resource.delete({
            where: { id: resource.id }
          })
        })
      )
    }

    await tx.patch.delete({
      where: { id: patchId }
    })

    return {}
  })
}
