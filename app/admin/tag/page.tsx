import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { kunGetActions } from '~/app/tag/actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { AdminTagContainer } from '~/components/admin/tag/Container'
import { metadata as tagMetadata } from './metadata'

export const revalidate = 3
export const metadata: Metadata = tagMetadata

export default async function AdminTagPage() {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 2) {
    redirect('/')
  }

  const response = await kunGetActions({
    page: 1,
    limit: 30
  })

  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <AdminTagContainer
      initialTags={response.tags}
      initialTotal={response.total}
      role={payload.role}
    />
  )
}
