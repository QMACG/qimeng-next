import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { updateTagSchema } from '~/validations/tag'
import { parseJsonStringArray, toJsonStringArray } from '~/utils/prismaJson'
import type { TagDetail } from '~/types/api/tag'

export const updateTag = async (input: z.infer<typeof updateTagSchema>) => {
  const { tagId, name, introduction = '', alias = [] } = input

  const existingTag = await prisma.patch_tag.findFirst({
    where: {
      OR: [{ name }, { alias: { array_contains: [name] } }]
    }
  })
  if (existingTag && existingTag.id !== tagId) {
    return '这个标签已经存在'
  }

  const newTag = await prisma.patch_tag.update({
    where: { id: tagId },
    data: {
      name,
      introduction,
      alias: toJsonStringArray(alias)
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  })

  const result: TagDetail = {
    ...newTag,
    alias: parseJsonStringArray(newTag.alias)
  }

  return result
}
