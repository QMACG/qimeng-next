import Link from 'next/link'
import { Button } from '@heroui/button'
import { ChevronRight } from 'lucide-react'
import { GalgameCard } from '~/components/galgame/Card'
import { NsfwVisibilityHint } from '~/components/kun/NsfwVisibilityHint'
import { FeaturedPostAdvertisements } from './FeaturedPostAdvertisements'
import { HomeAnnouncementModal } from './HomeAnnouncementModal'
import { HomeHero } from './hero/HomeHero'
import type { AdminHomeAnnouncementConfig } from '~/types/api/admin'

interface Props {
  galgames: GalgameCard[]
  nsfwHiddenCount?: number
  homeAnnouncement?: AdminHomeAnnouncementConfig | null
}

export const HomeContainer = ({
  galgames,
  nsfwHiddenCount = 0,
  homeAnnouncement = null
}: Props) => {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <HomeAnnouncementModal announcement={homeAnnouncement} />
      <HomeHero />

      <section className="space-y-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-bold sm:text-2xl">最新游戏</h2>
          <Button
            variant="light"
            as={Link}
            color="primary"
            endContent={<ChevronRight className="size-4" />}
            href="/galgame"
          >
            查看更多
          </Button>
        </div>

        <NsfwVisibilityHint count={nsfwHiddenCount} />

        <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          <FeaturedPostAdvertisements />
          {galgames.map((galgame) => (
            <GalgameCard
              key={galgame.id}
              patch={galgame}
              openOnNewTab={false}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
