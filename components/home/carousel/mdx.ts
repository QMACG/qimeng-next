import { prisma } from '~/prisma/index'
import { canAccessRestrictedContent } from '~/utils/contentVisibility'

export interface HomeCarouselMetadata {
  title: string
  banner: string
  description: string
  date: string
  authorName: string
  authorAvatar: string
  pin: boolean
  directory: string
  directoryLabel: string
  link: string
}

interface ViewerContext {
  uid?: number
  role?: number
}

const mapPost = (post: {
  slug: string
  title: string
  banner: string
  description: string
  published_at: Date
  author_name: string
  author_avatar: string
  pin: boolean
  category: string
  directory_label: string
}): HomeCarouselMetadata => ({
  title: post.title,
  banner: post.banner || '/favicon.ico',
  description: post.description,
  date: post.published_at.toISOString(),
  authorName: post.author_name || '绮梦编辑部',
  authorAvatar: post.author_avatar || '/favicon.ico',
  pin: post.pin,
  directory: post.category,
  directoryLabel: post.directory_label,
  link: `/doc/${post.slug}`
})

export const getKunPosts = async (
  viewer: ViewerContext = {}
): Promise<HomeCarouselMetadata[]> => {
  const pinnedPosts = await prisma.doc_post.findMany({
    where: {
      pin: true
    },
    orderBy: [{ sort_order: 'desc' }, { published_at: 'desc' }],
    select: {
      slug: true,
      title: true,
      banner: true,
      description: true,
      published_at: true,
      author_name: true,
      author_avatar: true,
      pin: true,
      category: true,
      directory_label: true,
      visibility: true,
      author_id: true
    }
  })

  return pinnedPosts
    .filter((post) =>
      canAccessRestrictedContent({
        visibility: post.visibility,
        authorId: post.author_id,
        uid: viewer.uid ?? 0,
        role: viewer.role ?? 0
      })
    )
    .map((post) => mapPost(post))
}
