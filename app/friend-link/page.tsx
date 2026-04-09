import type { Metadata } from 'next'
import { KunFriendLink } from '~/components/friend-link/KunFriendLink'
import { kunMetadata } from './metadata'
import { getPublicFriendLinks } from '~/app/api/admin/friend-link/_shared'

export const metadata: Metadata = kunMetadata

export default async function FriendLinkPage() {
  const links = await getPublicFriendLinks()

  return <KunFriendLink links={links} />
}
