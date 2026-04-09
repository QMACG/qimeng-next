import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { createTagSchema } from '~/validations/tag'
import { parseJsonStringArray, toJsonStringArray } from '~/utils/prismaJson'

export const createTag = async (
  input: z.infer<typeof createTagSchema>,
  uid: number
) => {
  const { name, introduction = '', alias = [] } = input

  const existingTag = await prisma.patch_tag.findFirst({
    where: {
      OR: [{ name }, { alias: { array_contains: [name] } }]
    }
  })
  if (existingTag) {
    return '这个标签已经存在'
  }

  const newTag = await prisma.patch_tag.create({
    data: {
      user_id: uid,
      name,
      introduction,
      alias: toJsonStringArray(alias)
    },
    select: {
      id: true,
      name: true,
      count: true,
      alias: true
    }
  })

  return {
    ...newTag,
    alias: parseJsonStringArray(newTag.alias)
  }
}
