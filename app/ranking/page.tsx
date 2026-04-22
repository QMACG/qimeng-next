import { RankingContainer } from '~/components/ranking/RankingContainer'
import { kunGetRankingActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
// import { kunMetadata } from './metadata'
import {
  getSearchParamValue,
  parsePositiveIntParam
} from '~/utils/galgameFilter'
import type { RankingSortField } from '~/types/api/ranking'
import { RANKING_SORT_FIELDS } from '~/types/api/ranking'

const DEFAULT_MIN_COUNT = 10
const PAGE_SIZE = 48

const DEFAULT_SORT_FIELD: RankingSortField = 'rating'
const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc'

const parseSortField = (raw: string | undefined): RankingSortField => {
  if (raw && RANKING_SORT_FIELDS.includes(raw as RankingSortField)) {
    return raw as RankingSortField
  }
  return DEFAULT_SORT_FIELD
}

const parseSortOrder = (raw: string | undefined): 'asc' | 'desc' => {
  return raw === 'asc' || raw === 'desc' ? raw : DEFAULT_SORT_ORDER
}

export const revalidate = 3

// export const metadata: Metadata = kunMetadata

interface PageProps {
  searchParams?: Promise<{
    page?: string | string[]
    sortField?: string | string[]
    sortOrder?: string | string[]
    minRatingCount?: string | string[]
  }>
}

export default async function RankingPage({ searchParams }: PageProps) {
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
  const minRaw = getSearchParamValue(res.minRatingCount)
  const minParsed =
    minRaw != null && minRaw !== '' ? Number.parseInt(minRaw, 10) : NaN
  const minRatingCount = Number.isFinite(minParsed)
    ? Math.max(0, Math.min(9999, Math.floor(minParsed)))
    : DEFAULT_MIN_COUNT

  const response = await kunGetRankingActions({
    sortField,
    sortOrder,
    minRatingCount,
    page: currentPage,
    limit: PAGE_SIZE
  })

  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <RankingContainer
      initialGalgames={response.galgames}
      initialTotal={response.total}
      initialPage={currentPage}
      initialSortField={sortField}
      initialSortOrder={sortOrder}
      initialMinRatingCount={minRatingCount}
      defaultMinRatingCount={DEFAULT_MIN_COUNT}
      defaultSortField={DEFAULT_SORT_FIELD}
      defaultSortOrder={DEFAULT_SORT_ORDER}
      pageSize={PAGE_SIZE}
    />
  )
}
