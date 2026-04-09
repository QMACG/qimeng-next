import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { AdminAdvertisementContainer } from '~/components/admin/advertisement/Container'
import { getAdminAdvertisements } from '~/app/api/admin/advertisement/_shared'
import { metadata as advertisementMetadata } from './metadata'

export const revalidate = 3
export const metadata: Metadata = advertisementMetadata

export default async function AdminAdvertisementPage() {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 2) {
    redirect('/')
  }

  try {
    const response = await getAdminAdvertisements()

    return (
      <AdminAdvertisementContainer
        initialAdvertisements={response.advertisements}
        docCandidates={response.docCandidates}
      />
    )
  } catch (error) {
    console.error('Failed to load advertisements:', error)
    return <ErrorComponent error="广告数据加载失败" />
  }
}
