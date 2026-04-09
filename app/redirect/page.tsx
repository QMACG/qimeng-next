import type { Metadata } from 'next'
import { metadata as redirectMetadata } from './metadata'
import { KunRedirectContainer } from '~/components/redirect/Container'
import { getRedirectBoxAdvertisement } from '~/components/redirect/advertisements'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'

export const metadata: Metadata = redirectMetadata

export default async function RedirectPage() {
  const payload = await verifyHeaderCookie()
  const advertisement = await getRedirectBoxAdvertisement({ uid: payload?.uid })

  return <KunRedirectContainer advertisement={advertisement} />
}
