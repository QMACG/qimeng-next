import { generateKunMetadataTemplate } from './metadata'
import { CompanyDetailContainer } from '~/components/company/detail/Container'
import { kunGetCompanyByIdActions, kunCompanyGalgameActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import type { SortField, SortOrder } from '~/components/galgame/_sort'
import type { Metadata } from 'next'
import {
  DEFAULT_GALGAME_SORT_FIELD,
  DEFAULT_GALGAME_SORT_ORDER,
  getSearchParamValue,
  parsePositiveIntParam
} from '~/utils/galgameFilter'

export const revalidate = 5

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
}: Props): Promise<Metadata> => {
  const { id } = await params
  const company = await kunGetCompanyByIdActions({ companyId: Number(id) })
  if (typeof company === 'string') {
    return {}
  }
  return generateKunMetadataTemplate(company)
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

  const company = await kunGetCompanyByIdActions({ companyId: Number(id) })
  if (typeof company === 'string') {
    return <ErrorComponent error={company} />
  }

  const response = await kunCompanyGalgameActions({
    companyId: Number(id),
    page: currentPage,
    limit: 24,
    sortField,
    sortOrder
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <CompanyDetailContainer
      initialCompany={company}
      initialPatches={response.galgames}
      total={response.total}
    />
  )
}
