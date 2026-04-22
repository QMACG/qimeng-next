import { Container } from '~/components/company/Container'
import { kunGetActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { kunMetadata } from './metadata'
import { parsePositiveIntParam } from '~/utils/galgameFilter'
import type { Metadata } from 'next'

export const revalidate = 5

export const metadata: Metadata = kunMetadata

interface PageProps {
  searchParams?: Promise<{ page?: string | string[] }>
}

export default async function Kun({ searchParams }: PageProps) {
  const res = (await searchParams) ?? {}
  const pageParam = Array.isArray(res.page) ? res.page[0] : res.page
  const currentPage = parsePositiveIntParam(pageParam, 1)

  const response = await kunGetActions({
    page: currentPage,
    limit: 100
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Container
      initialCompanies={response.companies}
      initialTotal={response.total}
      initialPage={currentPage}
    />
  )
}
