import { CardContainer } from '~/components/comment/Container'
import { kunMetadata } from './metadata'
import { Suspense } from 'react'
import { kunGetActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import type { Metadata } from 'next'
import {
  getSearchParamValue,
  parsePositiveIntParam
} from '~/utils/galgameFilter'
import type { SortDirection, SortOption } from '~/components/comment/_sort'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

const DEFAULT_SORT_FIELD: SortOption = 'created'
const DEFAULT_SORT_ORDER: SortDirection = 'desc'

const parseSortField = (raw: string | undefined): SortOption => {
  return raw === 'created' || raw === 'like' ? raw : DEFAULT_SORT_FIELD
}

const parseSortOrder = (raw: string | undefined): SortDirection => {
  return raw === 'asc' || raw === 'desc' ? raw : DEFAULT_SORT_ORDER
}

interface Props {
  searchParams?: Promise<{
    page?: string | string[]
    sortField?: string | string[]
    sortOrder?: string | string[]
  }>
}

export default async function Kun({ searchParams }: Props) {
  const res = (await searchParams) ?? {}
  const currentPage = parsePositiveIntParam(
    getSearchParamValue(res.page) ?? null,
    1
  )
  const sortField = parseSortField(
    getSearchParamValue(res.sortField) as string | undefined
  )
  const sortOrder = parseSortOrder(
    getSearchParamValue(res.sortOrder) as string | undefined
  )

  const response = await kunGetActions({
    sortField,
    sortOrder,
    page: currentPage,
    limit: 50
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  const payload = await verifyHeaderCookie()

  return (
    <Suspense>
      <CardContainer
        initialComments={response.comments}
        initialTotal={response.total}
        initialPage={currentPage}
        initialSortField={sortField}
        initialSortOrder={sortOrder}
        uid={payload?.uid}
      />
    </Suspense>
  )
}
