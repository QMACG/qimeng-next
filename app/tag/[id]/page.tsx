import { Suspense } from 'react'
import type { Metadata } from 'next'
import { TagDetailContainer } from '~/components/tag/detail/Container'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import {
  DEFAULT_GALGAME_SORT_FIELD,
  DEFAULT_GALGAME_SORT_ORDER,
  getSearchParamValue,
  parsePositiveIntParam
} from '~/utils/galgameFilter'
import type { SortField, SortOrder } from '~/components/galgame/_sort'
import { generateKunMetadataTemplate } from './metadata'
import { generateNullMetadata } from '~/utils/noIndex'
import { kunGetTagByIdActions, kunTagGalgameActions } from './actions'

export const revalidate = 3

interface Props {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    page?: string | string[]
    sortField?: SortField | string[]
    sortOrder?: SortOrder | string[]
  }>
}

export const generateMetadata = async ({
  params
}: Pick<Props, 'params'>): Promise<Metadata> => {
  const { id } = await params
  const tag = await kunGetTagByIdActions({ tagId: Number(id) })

  if (typeof tag === 'string') {
    return generateNullMetadata('标签详情')
  }

  return generateKunMetadataTemplate(tag.name, tag.id)
}

export default async function Kun({ params, searchParams }: Props) {
  const { id } = await params
  const res = await searchParams
  const sortField =
    (getSearchParamValue(res?.sortField) as SortField | undefined) ||
    DEFAULT_GALGAME_SORT_FIELD
  const sortOrder =
    (getSearchParamValue(res?.sortOrder) as SortOrder | undefined) ||
    DEFAULT_GALGAME_SORT_ORDER
  const currentPage = parsePositiveIntParam(getSearchParamValue(res?.page), 1)

  const tag = await kunGetTagByIdActions({ tagId: Number(id) })
  if (typeof tag === 'string') {
    return <ErrorComponent error={tag} />
  }

  const response = await kunTagGalgameActions({
    tagId: Number(id),
    page: currentPage,
    limit: 24,
    sortField,
    sortOrder
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <TagDetailContainer
        initialTag={tag}
        initialPatches={response.galgames}
        total={response.total}
        initialNsfwHiddenCount={response.nsfwHiddenCount}
        initialPage={currentPage}
        initialSortField={sortField}
        initialSortOrder={sortOrder}
      />
    </Suspense>
  )
}
