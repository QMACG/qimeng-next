import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { invalidatePatchContentCache } from '~/app/api/patch/cache'
import { patchUpdateSchema } from '~/validations/edit'
import { handleBatchPatchTags } from './batchTag'
import { syncPatchCompanies } from './syncPatchCompanies'

export const updateGalgame = async (
  input: z.infer<typeof patchUpdateSchema>,
  uid: number
) => {
  const patch = await prisma.patch.findUnique({ where: { id: input.id } })
  if (!patch) {
    return '未找到对应的游戏'
  }

  const {
    id,
    companyIds,
    resourceNote,
    name,
    introduction,
    status,
    contentLimit,
    released
  } = input

  await prisma.patch.update({
    where: { id },
    data: {
      name,
      banner: input.banner,
      introduction,
      resource_note: resourceNote,
      visibility: status,
      content_limit: contentLimit,
      released
    }
  })

  await handleBatchPatchTags(id, input.tag, uid)
  await syncPatchCompanies(id, companyIds ?? [])

  try {
    await invalidatePatchContentCache(patch.unique_id)
  } catch (error) {
    console.error(`Failed to invalidate patch cache for ${patch.unique_id}:`, error)
  }

  return {}
}
