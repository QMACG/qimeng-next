import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { searchTagSchema } from '~/validations/search'
import { parseJsonStringArray } from '~/utils/prismaJson'

const searchTag = async (input: z.infer<typeof searchTagSchema>) => {
  const { query } = input

  const data = await prisma.patch_tag.findMany({
    where: {
      OR: query.flatMap((q) => [
        { name: { contains: q } },
        { alias: { array_contains: [q] } }
      ])
    },
    select: {
      id: true,
      name: true,
      count: true,
      alias: true
    },
    orderBy: { count: 'desc' },
    take: 100
  })

  const tags = data.map((tag) => ({
    type: 'tag',
    ...tag,
    alias: parseJsonStringArray(tag.alias)
  }))

  return tags
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, searchTagSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await searchTag(input)
  return NextResponse.json(response)
}

