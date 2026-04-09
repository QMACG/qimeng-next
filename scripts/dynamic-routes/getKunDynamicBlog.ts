import { prisma } from '~/prisma/index'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'

interface KunDynamicBlogSitemap {
  path: string
  lastmod: string
}

export const getKunDynamicBlog = async (): Promise<KunDynamicBlogSitemap[]> => {
  try {
    const posts = await prisma.doc_post.findMany({
      where: { visibility: CONTENT_VISIBILITY.public },
      select: {
        slug: true,
        updated: true
      }
    })

    return posts.map((post) => ({
      path: `/doc/${post.slug}`,
      lastmod: post.updated?.toISOString() || new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error fetching dynamic blog routes:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}
