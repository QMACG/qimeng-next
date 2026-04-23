import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { DocContainer } from '~/components/admin/doc/Container'
import { kunGetActions } from './actions'
import { kunMetadata } from './metadata'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

export default async function AdminDocPage() {
  const response = await kunGetActions({
    page: 1,
    limit: 30
  })

  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <DocContainer
        initialPosts={response.posts}
        initialTotal={response.total}
      />
    </Suspense>
  )
}
