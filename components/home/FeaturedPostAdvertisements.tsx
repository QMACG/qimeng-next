import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Chip } from '@heroui/chip'
import { Image } from '@heroui/image'
import Link from 'next/link'
import { getDocDirectoryLabel } from '~/constants/doc'
import { isPrivateVisibility } from '~/utils/contentVisibility'
import { getAdvertisementModel } from '~/utils/prisma/advertisement'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { formatTimeDifference } from '~/utils/time'

interface ViewerContext {
  uid?: number
}

interface FeaturedPostAdvertisement {
  id: number
  title: string
  banner: string
  description: string
  date: string
  directory: string
  directoryLabel: string
  link: string
}

export const getFeaturedPostAdvertisements = async (
  viewer: ViewerContext = {}
): Promise<FeaturedPostAdvertisement[]> => {
  const advertisementModel = getAdvertisementModel()
  if (!advertisementModel) {
    console.warn(
      '[advertisement] Prisma Client 尚未包含 site_advertisement 模型，首页置顶广告将暂时按无广告处理。'
    )
    return []
  }

  const advertisements = await advertisementModel.findMany({
    where: {
      kind: 'featured_post'
    },
    orderBy: [{ sort_order: 'desc' }, { id: 'desc' }],
    include: {
      doc_post: {
        select: {
          id: true,
          slug: true,
          title: true,
          banner: true,
          description: true,
          published_at: true,
          category: true,
          directory_label: true,
          visibility: true
        }
      }
    }
  })

  return advertisements
    .filter((advertisement) =>
      viewer.uid ? true : advertisement.visible_for_guest
    )
    .flatMap((advertisement) => {
      if (advertisement.target_mode === 'external') {
        if (
          !advertisement.title ||
          !advertisement.banner ||
          !advertisement.link
        ) {
          return []
        }

        return [
          {
            id: advertisement.id,
            title: advertisement.title,
            banner: advertisement.banner,
            description: '',
            date: advertisement.updated.toISOString(),
            directory: 'advertisement',
            directoryLabel: '推荐',
            link: advertisement.link
          }
        ]
      }

      if (!advertisement.doc_post) {
        return []
      }

      // 首页广告卡片与「读正文」权限解耦：不再使用 canAccessRestrictedContent，
      // 避免仅编辑/管理员可见；仍不展示指向私有文章的推广位（后台也不应选私有文）。
      if (isPrivateVisibility(advertisement.doc_post.visibility)) {
        return []
      }

      return [
        {
          id: advertisement.id,
          title: advertisement.doc_post.title,
          banner: advertisement.doc_post.banner || '/favicon.ico',
          description: advertisement.doc_post.description,
          date: advertisement.doc_post.published_at.toISOString(),
          directory: advertisement.doc_post.category,
          directoryLabel: advertisement.doc_post.directory_label,
          link: advertisement.link || `/doc/${advertisement.doc_post.slug}`
        }
      ]
    })
}

const FeaturedPostAdvertisementCard = ({
  advertisement
}: {
  advertisement: FeaturedPostAdvertisement
}) => {
  return (
    <Card
      isPressable
      as={Link}
      href={advertisement.link}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full border border-default-100 dark:border-default-200"
    >
      <CardHeader className="p-0">
        <div className="relative mx-auto w-full overflow-hidden rounded-t-lg text-center opacity-90">
          <Image
            radius="none"
            alt={advertisement.title}
            className="size-full object-cover"
            removeWrapper={true}
            src={advertisement.banner || '/favicon.ico'}
            style={{ aspectRatio: '16/9' }}
          />
          <div className="absolute left-2 top-2 z-10">
            <Chip color="warning" variant="solid" size="sm">
              置顶
            </Chip>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-2">
        <h2 className="line-clamp-2 text-small font-semibold transition-colors hover:text-primary-500 sm:text-lg">
          {advertisement.title}
        </h2>
        {advertisement.description ? (
          <p className="line-clamp-2 text-xs leading-6 text-default-500 sm:text-sm">
            {advertisement.description}
          </p>
        ) : (
          <div className="h-[44px] sm:h-[48px]" />
        )}
      </CardBody>

      <CardFooter className="flex flex-wrap items-center gap-2 pt-0">
        <Chip variant="flat" color="primary" size="sm">
          {getDocDirectoryLabel(
            advertisement.directory,
            advertisement.directoryLabel
          )}
        </Chip>
        <Chip variant="flat" size="sm">
          {formatTimeDifference(advertisement.date)}
        </Chip>
      </CardFooter>
    </Card>
  )
}

export const FeaturedPostAdvertisements = async () => {
  const payload = await verifyHeaderCookie()
  const advertisements = await getFeaturedPostAdvertisements({
    uid: payload?.uid
  })

  if (!advertisements.length) {
    return null
  }

  return (
    <>
      {advertisements.map((advertisement) => (
        <FeaturedPostAdvertisementCard
          key={advertisement.id}
          advertisement={advertisement}
        />
      ))}
    </>
  )
}
