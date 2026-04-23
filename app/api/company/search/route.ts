import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import { searchCompanySchema } from '~/validations/company'
import { kunParsePostBody } from '~/app/api/utils/parseQuery'
import { parseJsonStringArray } from '~/utils/prismaJson'

const searchCompany = async (input: z.infer<typeof searchCompanySchema>) => {
  const { query } = input

  const companies = await prisma.patch_company.findMany({
    where: {
      OR: query.map((item) => ({
        OR: [
          { name: { contains: item } },
          { alias: { array_contains: [item] } },
          { parent_brand: { array_contains: [item] } }
        ]
      }))
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

  return companies.map((company) => ({
    ...company,
    alias: parseJsonStringArray(company.alias)
  }))
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, searchCompanySchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await searchCompany(input)
  return NextResponse.json(response)
}
