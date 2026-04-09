import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { AdminFriendLinkContainer } from '~/components/admin/friend-link/Container'
import { getAdminFriendLinks } from '~/app/api/admin/friend-link/_shared'
import { metadata as friendLinkMetadata } from './metadata'

export const revalidate = 3
export const metadata: Metadata = friendLinkMetadata

export default async function AdminFriendLinkPage() {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 2) {
    redirect('/')
  }

  try {
    const initialLinks = await getAdminFriendLinks()
    return <AdminFriendLinkContainer initialLinks={initialLinks} />
  } catch (error) {
    console.error('Failed to load friend links:', error)
    return <ErrorComponent error="友情链接数据加载失败" />
  }
}
