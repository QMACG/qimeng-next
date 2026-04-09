import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { kunGetActions } from '~/app/company/actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { AdminCompanyContainer } from '~/components/admin/company/Container'
import { metadata as companyMetadata } from './metadata'

export const revalidate = 3
export const metadata: Metadata = companyMetadata

export default async function AdminCompanyPage() {
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
    <AdminCompanyContainer
      initialCompanies={response.companies}
      initialTotal={response.total}
      role={payload.role}
    />
  )
}
