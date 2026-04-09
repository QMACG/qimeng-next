import { prisma } from '~/prisma/index'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import { canAccessRestrictedContent } from '~/utils/contentVisibility'
import { markdownToText } from '~/utils/markdownToText'
import type { KunBlog, KunFrontmatter, KunPostMetadata } from './types'

const normalizeSlug = (slug: string) =>
  slug
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\.mdx$/, '')

const toPostMetadata = (post: {
  id: number
  title: string
  banner: string
  directory_label: string
  description: string
  content: string
  slug: string
  category: string
  pin: boolean
  published_at: Date
}): KunPostMetadata => ({
  id: post.id,
  title: post.title,
  banner: post.banner,
  directoryLabel: post.directory_label,
  date: post.published_at.toISOString(),
  description: post.description,
  textCount: markdownToText(post.content).length,
  slug: post.slug,
  path: post.slug,
  category: post.category,
  pin: post.pin
})

export const getAllPosts = async () => {
  const posts = await prisma.doc_post.findMany({
    where: { visibility: CONTENT_VISIBILITY.public },
    orderBy: [
      { pin: 'desc' },
      { sort_order: 'desc' },
      { published_at: 'desc' }
    ]
  })

  return posts.map(toPostMetadata)
}

export const getPostBySlug = async (
  slug: string,
  viewer?: { uid?: number; role?: number }
): Promise<KunBlog | null> => {
  const realSlug = normalizeSlug(slug)
  const post = await prisma.doc_post.findUnique({
    where: { slug: realSlug }
  })

  if (
    !post ||
    !canAccessRestrictedContent({
      visibility: post.visibility,
      authorId: post.author_id,
      uid: viewer?.uid,
      role: viewer?.role
    })
  ) {
    return null
  }

  const frontmatter: KunFrontmatter = {
    title: post.title,
    banner: post.banner,
    directoryLabel: post.directory_label,
    description: post.description,
    date: post.published_at.toISOString(),
    authorUid: post.author_id ?? 0,
    authorName: post.author_name,
    authorAvatar: post.author_avatar,
    authorHomepage: post.author_homepage,
    pin: post.pin,
    category: post.category
  }

  return {
    id: post.id,
    slug: post.slug,
    content: post.content,
    frontmatter
  }
}

export const getAdjacentPosts = async (currentSlug: string) => {
  const posts = await getAllPosts()
  const currentIndex = posts.findIndex(
    (post) => post.slug === normalizeSlug(currentSlug)
  )

  return {
    prev: currentIndex > 0 ? posts[currentIndex - 1] : null,
    next:
      currentIndex >= 0 && currentIndex < posts.length - 1
        ? posts[currentIndex + 1]
        : null
  }
}
