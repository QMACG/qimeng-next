import type { Metadata } from 'next'
import { KunFriendLink } from '~/components/friend-link/KunFriendLink'
import { kunMetadata } from './metadata'
import { getPublicFriendLinks } from '~/app/api/admin/friend-link/_shared'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'

export const metadata: Metadata = kunMetadata

export default async function FriendLinkPage() {
  const [links, frontDisplay] = await Promise.all([
    getPublicFriendLinks(),
    getFrontDisplayConfig()
  ])

  return (
    <KunFriendLink
      links={links}
      enableFriendLinkApply={frontDisplay.enableFriendLinkApply}
    />
  )
}
