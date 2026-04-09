import { Card, CardBody } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Sparkles } from 'lucide-react'
import { KunCarousel } from '../carousel/KunCarousel'
import { getKunPosts } from '../carousel/mdx'
import { KunHomeNavigationItems } from '../NavigationItems'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { HomeAdvertisementGrid } from './AdvertisementGrid'
import { getHomeBoxAdvertisements } from './advertisements'

const HomeWelcomeCard = () => {
  return (
    <Card className="h-full border-none bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-success-500/10">
      <CardBody className="flex justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-500" />
          <Chip color="primary" variant="flat">
            欢迎来到 {kunMoyuMoe.titleShort}
          </Chip>
        </div>

        <div className="space-y-4">
          <h1 className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text py-1 text-3xl font-bold text-transparent xl:text-4xl">
            免费 galgame 资源下载
          </h1>
          <p className="text-md text-default-600">专注分享次元世界-Galgame</p>
          <p className="text-sm leading-7 text-default-500">
            在这里浏览游戏文章、查看资源信息与最新内容更新。
          </p>
        </div>
      </CardBody>
    </Card>
  )
}

export const HomeHero = async () => {
  const payload = await verifyHeaderCookie()
  const [posts, advertisements] = await Promise.all([
    getKunPosts({ uid: payload?.uid, role: payload?.role }),
    getHomeBoxAdvertisements({ uid: payload?.uid })
  ])

  const hasVisibleAdvertisements = advertisements.length > 0

  return (
    <div className="mx-auto w-full">
      <div className="grid grid-cols-1 gap-0 sm:min-h-[300px] sm:grid-cols-2 sm:gap-6">
        <div className="hidden sm:flex sm:flex-col sm:justify-center sm:space-y-6">
          <div className="h-full">
            {hasVisibleAdvertisements ? (
              <HomeAdvertisementGrid advertisements={advertisements} />
            ) : (
              <HomeWelcomeCard />
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-3 gap-3 sm:gap-6">
              <KunHomeNavigationItems buttonSize="lg" />
            </div>
          </div>
        </div>

        <div>
          <KunCarousel posts={posts} />
        </div>
      </div>

      {hasVisibleAdvertisements ? (
        <div className="mt-3 sm:hidden">
          <HomeAdvertisementGrid advertisements={advertisements} />
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-3 sm:hidden">
        <KunHomeNavigationItems buttonSize="md" />
      </div>
    </div>
  )
}
