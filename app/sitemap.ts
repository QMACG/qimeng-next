import type { MetadataRoute } from 'next'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'
import { prisma } from '~/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${kunMoyuMoe.domain.main}${normalizedPath}`
}

const buildStaticRoutes = (): MetadataRoute.Sitemap => [
  {
    url: buildUrl('/'),
    changeFrequency: 'daily',
    priority: 1,
    lastModified: new Date()
  },
  {
    url: buildUrl('/galgame'),
    changeFrequency: 'daily',
    priority: 0.9,
    lastModified: new Date()
  },
  {
    url: buildUrl('/doc'),
    changeFrequency: 'weekly',
    priority: 0.8,
    lastModified: new Date()
  },
  {
    url: buildUrl('/tag'),
    changeFrequency: 'weekly',
    priority: 0.7,
    lastModified: new Date()
  },
  {
    url: buildUrl('/company'),
    changeFrequency: 'weekly',
    priority: 0.7,
    lastModified: new Date()
  },
  {
    url: buildUrl('/ranking'),
    changeFrequency: 'daily',
    priority: 0.7,
    lastModified: new Date()
  },
  {
    url: buildUrl('/friend-link'),
    changeFrequency: 'monthly',
    priority: 0.4,
    lastModified: new Date()
  }
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = buildStaticRoutes()

  try {
    const [patches, posts, tags, companies] = await Promise.all([
      prisma.patch.findMany({
        where: {
          visibility: CONTENT_VISIBILITY.public
        },
        select: {
          unique_id: true,
          updated: true
        },
        orderBy: {
          updated: 'desc'
        }
      }),
      prisma.doc_post.findMany({
        where: {
          visibility: CONTENT_VISIBILITY.public
        },
        select: {
          slug: true,
          updated: true
        },
        orderBy: {
          updated: 'desc'
        }
      }),
      prisma.patch_tag.findMany({
        select: {
          id: true,
          updated: true
        },
        orderBy: {
          updated: 'desc'
        }
      }),
      prisma.patch_company.findMany({
        select: {
          id: true,
          updated: true
        },
        orderBy: {
          updated: 'desc'
        }
      })
    ])

    const patchRoutes: MetadataRoute.Sitemap = patches.map((patch) => ({
      url: buildUrl(`/${patch.unique_id}`),
      lastModified: patch.updated,
      changeFrequency: 'daily',
      priority: 0.9
    }))

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: buildUrl(`/doc/${post.slug}`),
      lastModified: post.updated,
      changeFrequency: 'weekly',
      priority: 0.8
    }))

    const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: buildUrl(`/tag/${tag.id}`),
      lastModified: tag.updated,
      changeFrequency: 'weekly',
      priority: 0.6
    }))

    const companyRoutes: MetadataRoute.Sitemap = companies.map((company) => ({
      url: buildUrl(`/company/${company.id}`),
      lastModified: company.updated,
      changeFrequency: 'weekly',
      priority: 0.6
    }))

    return [
      ...staticRoutes,
      ...patchRoutes,
      ...postRoutes,
      ...tagRoutes,
      ...companyRoutes
    ]
  } catch (error) {
    console.error('Failed to generate dynamic sitemap, fallback to static routes.', error)
    return staticRoutes
  }
}
