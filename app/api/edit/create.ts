import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { patchCreateSchema } from '~/validations/edit'
import { toJsonStringArray } from '~/utils/prismaJson'
import { handleBatchPatchTags } from './batchTag'
import { syncPatchCompanies } from './syncPatchCompanies'

export const createGalgame = async (
  input: Omit<z.infer<typeof patchCreateSchema>, 'tag'> & { tag: string[] },
  uid: number
) => {
  const {
    name,
    publishedAt,
    companyIds,
    resourceNote,
    banner,
    tag,
    introduction,
    status,
    released,
    contentLimit
  } = input

  const galgameUniqueId = crypto.randomBytes(4).toString('hex')

  const res = await prisma.$transaction(
    async (tx) => {
      const patch = await tx.patch.create({
        data: {
          name,
          unique_id: galgameUniqueId,
          published: new Date(publishedAt),
          introduction,
          user_id: uid,
          banner,
          released,
          resource_note: resourceNote,
          visibility: status,
          content_limit: contentLimit,
          type: toJsonStringArray([]),
          language: toJsonStringArray([]),
          platform: toJsonStringArray([])
        }
      })

      await tx.patch_rating_stat.create({
        data: { patch_id: patch.id }
      })

      return { patchId: patch.id }
    },
    { timeout: 60000 }
  )

  if (tag.length) {
    await handleBatchPatchTags(res.patchId, tag, uid)
  }

  await syncPatchCompanies(res.patchId, companyIds ?? [])

  return { uniqueId: galgameUniqueId, patchId: res.patchId }
}
