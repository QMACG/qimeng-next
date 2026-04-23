import { prisma } from '~/prisma/index'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import type {
  AdminAdvertisement,
  AdvertisementDocCandidate,
  AdvertisementKind,
  FeaturedAdvertisementTargetMode
} from '~/types/api/advertisement'

const mapDocCandidate = (post: {
  id: number
  title: string
  slug: string
  banner: string
  description: string
  visibility: number
  directory_label: string
  published_at: Date
}): AdvertisementDocCandidate => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  banner: post.banner || '/favicon.ico',
  description: post.description,
  status: post.visibility,
  directoryLabel: post.directory_label,
  publishedAt: String(post.published_at)
})

export const mapAdvertisement = (advertisement: {
  id: number
  kind: string
  title: string
  banner: string
  link: string
  target_mode: string
  visible_for_guest: boolean
  sort_order: number
  slot: number | null
  doc_post_id: number | null
  created: Date
  updated: Date
  doc_post?: {
    id: number
    title: string
    slug: string
    banner: string
    description: string
    visibility: number
    directory_label: string
    published_at: Date
  } | null
}): AdminAdvertisement => ({
  id: advertisement.id,
  kind: advertisement.kind as AdvertisementKind,
  title: advertisement.title,
  banner: advertisement.banner,
  link: advertisement.link,
  targetMode:
    advertisement.kind === 'featured_post'
      ? (advertisement.target_mode as FeaturedAdvertisementTargetMode)
      : null,
  visibleForGuest: advertisement.visible_for_guest,
  sortOrder: advertisement.sort_order,
  slot: advertisement.slot,
  docPostId: advertisement.doc_post_id,
  created: String(advertisement.created),
  updated: String(advertisement.updated),
  docPost: advertisement.doc_post
    ? mapDocCandidate(advertisement.doc_post)
    : null
})

export const getAdvertisementDocCandidates = async () => {
  const posts = await prisma.doc_post.findMany({
    where: {
      category: 'advertisement',
      visibility: {
        not: CONTENT_VISIBILITY.private
      }
    },
    orderBy: [{ sort_order: 'desc' }, { published_at: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      banner: true,
      description: true,
      visibility: true,
      directory_label: true,
      published_at: true
    }
  })

  return posts.map(mapDocCandidate)
}

export const getAdminAdvertisements = async () => {
  const [advertisements, docCandidates] = await Promise.all([
    prisma.site_advertisement.findMany({
      orderBy: [
        { kind: 'asc' },
        { slot: 'asc' },
        { sort_order: 'desc' },
        { id: 'asc' }
      ],
      include: {
        doc_post: {
          select: {
            id: true,
            title: true,
            slug: true,
            banner: true,
            description: true,
            visibility: true,
            directory_label: true,
            published_at: true
          }
        }
      }
    }),
    getAdvertisementDocCandidates()
  ])

  return {
    advertisements: advertisements.map(mapAdvertisement),
    docCandidates
  }
}
