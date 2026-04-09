import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { getTagByIdSchema } from '~/validations/tag'
import { parseJsonStringArray } from '~/utils/prismaJson'
import type { TagDetail } from '~/types/api/tag'

export const getTagById = async (input: z.infer<typeof getTagByIdSchema>) => {
  const { tagId } = input

  const tag = await prisma.patch_tag.findUnique({
    where: { id: tagId },
    select: {
      id: true,
      name: true,
      count: true,
      alias: true,
      introduction: true,
      created: true,
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  })
  if (!tag) {
    return '未找到标签'
  }

  const response: TagDetail = {
    ...tag,
    alias: parseJsonStringArray(tag.alias)
  }

  return response
}
