import { CardContainer } from '~/components/galgame/Container'
import { kunMetadata } from './metadata'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { kunGetActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import {
  DEFAULT_GALGAME_SORT_FIELD,
  DEFAULT_GALGAME_SORT_ORDER,
  getSearchParamValue,
  parsePositiveIntParam
} from '~/utils/galgameFilter'
import type { SortField, SortOrder } from '~/components/galgame/_sort'
import type { Metadata } from 'next'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

interface Props {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const normalizeSortField = (value?: string): SortField => {
  const candidates: SortField[] = [
    'resource_update_time',
    'created',
    'view',
    'download',
    'favorite',
    'rating'
  ]

  return candidates.includes(value as SortField)
    ? (value as SortField)
    : DEFAULT_GALGAME_SORT_FIELD
}

const normalizeSortOrder = (value?: string): SortOrder => {
  return value === 'asc' || value === 'desc'
    ? value
    : DEFAULT_GALGAME_SORT_ORDER
}

export default async function Kun({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const initialPage = parsePositiveIntParam(
    getSearchParamValue(resolvedSearchParams.page) ?? null,
    1
  )
  const initialSortField = normalizeSortField(
    getSearchParamValue(resolvedSearchParams.sortField)
  )
  const initialSortOrder = normalizeSortOrder(
    getSearchParamValue(resolvedSearchParams.sortOrder)
  )

  if (
    getSearchParamValue(resolvedSearchParams.sortField) === undefined ||
    getSearchParamValue(resolvedSearchParams.sortOrder) === undefined
  ) {
    const sp = new URLSearchParams()
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (value === undefined) {
        continue
      }
      if (key === 'sortField' || key === 'sortOrder') {
        continue
      }
      if (Array.isArray(value)) {
        for (const v of value) {
          sp.append(key, v)
        }
      } else {
        sp.set(key, value)
      }
    }
    sp.set('sortField', initialSortField)
    sp.set('sortOrder', initialSortOrder)
    redirect(`/galgame?${sp.toString()}`)
  }

  const response = await kunGetActions({
    sortField: initialSortField,
    sortOrder: initialSortOrder,
    page: initialPage,
    limit: 24
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <CardContainer
        initialGalgames={response.galgames}
        initialTotal={response.total}
        initialNsfwHiddenCount={response.nsfwHiddenCount}
        initialPage={initialPage}
        initialSortField={initialSortField}
        initialSortOrder={initialSortOrder}
      />
    </Suspense>
  )
}
