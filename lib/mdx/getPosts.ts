import { prisma } from '~/prisma/index'
import { unstable_noStore as noStore } from 'next/cache'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import {
  canAccessRestrictedContent,
  isPrivateVisibility
} from '~/utils/contentVisibility'
import { getAdvertisementModel } from '~/utils/prisma/advertisement'
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
  noStore()

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

/** 广告目录文章内页：与首页广告展示规则一致，不套用「隐藏文」的读正文权限 */
const canAccessAdvertisementDocPost = async (
  post: {
    id: number
    category: string
    visibility: number
    author_id: number | null
  },
  viewer?: { uid?: number; role?: number }
): Promise<boolean> => {
  if (post.category !== 'advertisement') {
    return false
  }
  if (isPrivateVisibility(post.visibility)) {
    return false
  }
  const loggedIn = Boolean(viewer?.uid)
  if (loggedIn) {
    return true
  }
  const advertisementModel = getAdvertisementModel()
  if (!advertisementModel) {
    return true
  }
  const rows = await advertisementModel.findMany({
    where: {
      kind: 'featured_post',
      doc_post_id: post.id,
      target_mode: 'article'
    },
    select: { visible_for_guest: true }
  })
  if (rows.length === 0) {
    return true
  }
  return rows.some((row) => row.visible_for_guest)
}

export const getPostBySlug = async (
  slug: string,
  viewer?: { uid?: number; role?: number }
): Promise<KunBlog | null> => {
  noStore()

  const realSlug = normalizeSlug(slug)
  const post = await prisma.doc_post.findUnique({
    where: { slug: realSlug }
  })

  if (!post) {
    return null
  }

  const canAccess =
    (await canAccessAdvertisementDocPost(post, viewer)) ||
    canAccessRestrictedContent({
      visibility: post.visibility,
      authorId: post.author_id,
      uid: viewer?.uid,
      role: viewer?.role
    })

  if (!canAccess) {
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
  noStore()

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
