import { Container } from '~/components/tag/Container'
import { kunMetadata } from './metadata'
import { kunGetActions } from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { Suspense } from 'react'
import { parsePositiveIntParam } from '~/utils/galgameFilter'
import type { Metadata } from 'next'

export const revalidate = 3

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
    <Suspense>
      <Container
        initialTags={response.tags}
        initialTotal={response.total}
        initialPage={currentPage}
      />
    </Suspense>
  )
}
