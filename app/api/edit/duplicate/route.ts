import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { kunParseGetQuery } from '~/app/api/utils/parseQuery'
import { prisma } from '~/prisma/index'
import { duplicateSchema } from '~/validations/edit'
import type { Prisma } from '~/prisma/generated/prisma/client'

const duplicate = async (input: z.infer<typeof duplicateSchema>) => {
  const title = input.title
  const excludeId = input.excludeId ? Number(input.excludeId) : undefined

  if (!title) {
    return {}
  }

  const where: Prisma.patchWhereInput = {
    name: {
      equals: title
    }
  }

  if (excludeId) {
    where.id = { not: excludeId }
  }

  const patch = await prisma.patch.findFirst({
    where,
    select: {
      unique_id: true
    }
  })

  if (patch?.unique_id) {
    return { uniqueId: patch.unique_id }
  }

  return {}
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, duplicateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await duplicate(input)
  return NextResponse.json(response)
}
