import { HomeContainer } from '~/components/home/Container'
import { kunGetActions } from './actions'
import { getHomeAnnouncementConfig } from '~/app/api/admin/setting/home-announcement/getHomeAnnouncementConfig'

export const revalidate = 3

export default async function Kun() {
  const [response, homeAnnouncement] = await Promise.all([
    kunGetActions(),
    getHomeAnnouncementConfig().catch(() => null)
  ])

  return (
    <div className="container mx-auto my-4 space-y-6">
      <HomeContainer {...response} homeAnnouncement={homeAnnouncement} />
    </div>
  )
}
