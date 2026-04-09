import { redirect } from 'next/navigation'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { DocEditWorkspace } from '~/components/admin/doc/EditWorkspace'

export default async function AdminCreateDocPage() {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 2) {
    redirect('/')
  }

  return <DocEditWorkspace mode="create" />
}
