import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '~/prisma'
import {
  createCompanySchema,
  getCompanyByIdSchema,
  updateCompanySchema
} from '~/validations/company'
import {
  kunParseDeleteQuery,
  kunParseGetQuery,
  kunParsePostBody,
  kunParsePutBody
} from '../utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { parseJsonStringArray, toJsonStringArray } from '~/utils/prismaJson'

const deleteCompanySchema = z.object({
  companyId: z.coerce.number().min(1).max(9999999)
})

const getCompanyById = async (input: z.infer<typeof getCompanyByIdSchema>) => {
  const { companyId } = input

  const company = await prisma.patch_company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      count: true,
      alias: true,
      introduction: true,
      primary_language: true,
      official_website: true,
      parent_brand: true,
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
  if (!company) {
    return '未找到会社'
  }

  return {
    ...company,
    alias: parseJsonStringArray(company.alias),
    primary_language: parseJsonStringArray(company.primary_language),
    official_website: parseJsonStringArray(company.official_website),
    parent_brand: parseJsonStringArray(company.parent_brand)
  }
}

export const GET = async (req: NextRequest) => {
  const input = kunParseGetQuery(req, getCompanyByIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await getCompanyById(input)
  return NextResponse.json(response)
}

const rewriteCompany = async (input: z.infer<typeof updateCompanySchema>) => {
  const {
    companyId,
    name,
    primary_language,
    introduction = '',
    alias = [],
    official_website = [],
    parent_brand = []
  } = input

  const existingCompany = await prisma.patch_company.findFirst({
    where: {
      OR: [{ name }, { alias: { array_contains: [name] } }]
    }
  })
  if (existingCompany && existingCompany.id !== companyId) {
    return '这个会社已经存在'
  }

  const newCompany = await prisma.patch_company.update({
    where: { id: companyId },
    data: {
      name,
      introduction,
      alias: toJsonStringArray(alias),
      primary_language: toJsonStringArray(primary_language),
      official_website: toJsonStringArray(official_website),
      parent_brand: toJsonStringArray(parent_brand)
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

  return {
    ...newCompany,
    alias: parseJsonStringArray(newCompany.alias),
    primary_language: parseJsonStringArray(newCompany.primary_language),
    official_website: parseJsonStringArray(newCompany.official_website),
    parent_brand: parseJsonStringArray(newCompany.parent_brand)
  }
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, updateCompanySchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 2) {
    return NextResponse.json('仅编辑及以上角色可以编辑会社信息')
  }

  const response = await rewriteCompany(input)
  return NextResponse.json(response)
}

const createCompany = async (
  input: z.infer<typeof createCompanySchema>,
  uid: number
) => {
  const {
    name,
    primary_language,
    introduction = '',
    alias = [],
    official_website = [],
    parent_brand = []
  } = input

  const existingCompany = await prisma.patch_company.findFirst({
    where: {
      OR: [{ name }, { alias: { array_contains: [name] } }]
    }
  })
  if (existingCompany) {
    return '这个会社已经存在'
  }

  const newCompany = await prisma.patch_company.create({
    data: {
      user_id: uid,
      name,
      introduction,
      alias: toJsonStringArray(alias),
      primary_language: toJsonStringArray(primary_language),
      official_website: toJsonStringArray(official_website),
      parent_brand: toJsonStringArray(parent_brand)
    },
    select: {
      id: true,
      name: true,
      count: true,
      alias: true
    }
  })

  return {
    ...newCompany,
    alias: parseJsonStringArray(newCompany.alias)
  }
}

export const POST = async (req: NextRequest) => {
  const input = await kunParsePostBody(req, createCompanySchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 2) {
    return NextResponse.json('仅编辑及以上角色可以创建会社信息')
  }

  const response = await createCompany(input, payload.uid)
  return NextResponse.json(response)
}

export const DELETE = async (req: NextRequest) => {
  const input = kunParseDeleteQuery(req, deleteCompanySchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('仅管理员可以删除会社')
  }

  await prisma.patch_company.delete({
    where: { id: input.companyId }
  })

  return NextResponse.json({})
}
