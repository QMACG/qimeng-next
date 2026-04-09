import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { AdminDirectDownloadContainer } from '~/components/admin/direct-download/Container'
import {
  getAdminDirectDownloadConfig,
  getAdminDirectDownloadIpBlacklist,
  getAdminDirectDownloadLogs,
  getAdminDirectDownloadStatistics,
  getAdminDirectDownloadUserBlacklist
} from '~/app/api/direct-download/_shared'
import { metadata as pageMetadata } from './metadata'

export const revalidate = 3
export const metadata: Metadata = pageMetadata

export default async function AdminDirectDownloadPage() {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 3) {
    redirect('/')
  }

  try {
    const [config, statistics, logs, ipBlacklist, userBlacklist] =
      await Promise.all([
        getAdminDirectDownloadConfig(),
        getAdminDirectDownloadStatistics(),
        getAdminDirectDownloadLogs({
          page: 1,
          limit: 20,
          status: 'all'
        }),
        getAdminDirectDownloadIpBlacklist(),
        getAdminDirectDownloadUserBlacklist()
      ])

    return (
      <AdminDirectDownloadContainer
        initialConfig={config}
        initialStatistics={statistics}
        initialLogs={logs}
        initialIpBlacklist={ipBlacklist}
        initialUserBlacklist={userBlacklist}
      />
    )
  } catch {
    return <ErrorComponent error="直链管理数据加载失败" />
  }
}
