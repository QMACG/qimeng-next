import { prisma } from '~/prisma/index'

export const syncPatchCompanies = async (
  patchId: number,
  companyIds: number[]
) => {
  const normalizedIds = Array.from(
    new Set(
      companyIds.filter(
        (companyId) => Number.isInteger(companyId) && companyId > 0
      )
    )
  )

  const validCompanies = normalizedIds.length
    ? await prisma.patch_company.findMany({
        where: { id: { in: normalizedIds } },
        select: { id: true }
      })
    : []
  const validCompanyIds = validCompanies.map((company) => company.id)

  const existingRelations = await prisma.patch_company_relation.findMany({
    where: { patch_id: patchId },
    select: { company_id: true }
  })
  const existingCompanyIds = existingRelations.map(
    (relation) => relation.company_id
  )

  const nextIds = new Set(validCompanyIds)
  const currentIds = new Set(existingCompanyIds)

  const toAdd = validCompanyIds.filter(
    (companyId) => !currentIds.has(companyId)
  )
  const toRemove = existingCompanyIds.filter(
    (companyId) => !nextIds.has(companyId)
  )

  if (toAdd.length) {
    await prisma.patch_company_relation.createMany({
      data: toAdd.map((companyId) => ({
        patch_id: patchId,
        company_id: companyId
      })),
      skipDuplicates: true
    })

    await prisma.patch_company.updateMany({
      where: { id: { in: toAdd } },
      data: { count: { increment: 1 } }
    })
  }

  if (toRemove.length) {
    await prisma.patch_company_relation.deleteMany({
      where: {
        patch_id: patchId,
        company_id: { in: toRemove }
      }
    })

    await prisma.patch_company.updateMany({
      where: { id: { in: toRemove } },
      data: { count: { decrement: 1 } }
    })
  }
}
