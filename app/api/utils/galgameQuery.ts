import type { SortField, SortOrder } from '~/components/galgame/_sort'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import type { Prisma } from '~/prisma/generated/prisma/client'

interface BuildGalgameWhereOptions {
  nsfwEnable: Record<string, string | undefined>
}

export const buildGalgameWhere = ({
  nsfwEnable
}: BuildGalgameWhereOptions): Prisma.patchWhereInput => {
  return {
    visibility: CONTENT_VISIBILITY.public,
    ...nsfwEnable
  }
}

export const buildGalgameOrderBy = (
  sortField: SortField,
  sortOrder: SortOrder
): Prisma.patchOrderByWithRelationInput => {
  if (sortField === 'favorite') {
    return { favorite_folder: { _count: sortOrder } }
  }

  if (sortField === 'rating') {
    return { rating_stat: { avg_overall: sortOrder } }
  }

  if (sortField === 'created') {
    return { published: sortOrder }
  }

  return { [sortField]: sortOrder }
}
