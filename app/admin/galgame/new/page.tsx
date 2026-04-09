import { redirect } from 'next/navigation'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { CreateWorkspace } from '~/components/admin/galgame/CreateWorkspace'

export default async function AdminCreateGalgamePage() {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 2) {
    redirect('/')
  }

  return <CreateWorkspace />
}
