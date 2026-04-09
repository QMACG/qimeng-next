import { prisma } from '~/prisma/index'
import { invalidatePatchContentCache } from '~/app/api/patch/cache'

export const recalcPatchType = async (
  patchId: number,
  tx: {
    patch: Pick<typeof prisma.patch, 'findUnique'>
  } = prisma
) => {
  const patch = await tx.patch.findUnique({
    where: { id: patchId },
    select: { unique_id: true }
  })

  if (!patch) {
    return
  }

  await invalidatePatchContentCache(patch.unique_id)
}
