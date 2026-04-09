import { redirect } from 'next/navigation'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'

export default async function AdminIndexPage() {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 2) {
    redirect('/')
  }

  redirect('/admin/galgame')
}
