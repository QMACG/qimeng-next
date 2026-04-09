import { writeFile } from 'fs/promises'
import prettier from 'prettier'
import { prisma } from '~/prisma/index'
import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'

const WEBSITE_URL =
  process.env.KUN_VISUAL_NOVEL_SITE_URL ||
  process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD ||
  process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV ||
  'http://127.0.0.1:3000'

const normalizeSiteUrl = (value: string) => value.replace(/\/+$/, '')

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'daily' | 'weekly' | 'monthly'
  priority?: number
}

const buildEntry = (entry: SitemapEntry) => `
  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${typeof entry.priority === 'number' ? `<priority>${entry.priority.toFixed(1)}</priority>` : ''}
  </url>
`

const generateKunSitemap = async () => {
  const baseUrl = normalizeSiteUrl(WEBSITE_URL)

  try {
    const [patches, posts, tags, companies] = await Promise.all([
      prisma.patch.findMany({
        where: { content_limit: 'sfw', visibility: CONTENT_VISIBILITY.public },
        select: {
          unique_id: true,
          updated: true
        }
      }),
      prisma.doc_post.findMany({
        where: { visibility: CONTENT_VISIBILITY.public },
        select: {
          slug: true,
          updated: true
        }
      }),
      prisma.patch_tag.findMany({
        select: {
          id: true,
          updated: true
        }
      }),
      prisma.patch_company.findMany({
        select: {
          id: true,
          updated: true
        }
      })
    ])

    const staticRoutes: SitemapEntry[] = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/galgame`, changefreq: 'daily', priority: 0.9 },
      { loc: `${baseUrl}/doc`, changefreq: 'weekly', priority: 0.8 },
      { loc: `${baseUrl}/tag`, changefreq: 'weekly', priority: 0.7 },
      { loc: `${baseUrl}/company`, changefreq: 'weekly', priority: 0.7 },
      { loc: `${baseUrl}/ranking`, changefreq: 'daily', priority: 0.7 },
      { loc: `${baseUrl}/friend-link`, changefreq: 'monthly', priority: 0.4 }
    ]

    const patchRoutes: SitemapEntry[] = patches.map((patch) => ({
      loc: `${baseUrl}/${patch.unique_id}`,
      lastmod: patch.updated.toISOString(),
      changefreq: 'daily',
      priority: 0.9
    }))

    const postRoutes: SitemapEntry[] = posts.map((post) => ({
      loc: `${baseUrl}/doc/${post.slug}`,
      lastmod: post.updated.toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    }))

    const tagRoutes: SitemapEntry[] = tags.map((tag) => ({
      loc: `${baseUrl}/tag/${tag.id}`,
      lastmod: tag.updated.toISOString(),
      changefreq: 'weekly',
      priority: 0.6
    }))

    const companyRoutes: SitemapEntry[] = companies.map((company) => ({
      loc: `${baseUrl}/company/${company.id}`,
      lastmod: company.updated.toISOString(),
      changefreq: 'weekly',
      priority: 0.6
    }))

    const sitemap = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${[...staticRoutes, ...patchRoutes, ...postRoutes, ...tagRoutes, ...companyRoutes]
          .map(buildEntry)
          .join('')}
      </urlset>
    `

    const formatted = await prettier.format(sitemap, { parser: 'html' })
    await writeFile('public/sitemap.xml', formatted)
    console.log('Sitemap generated successfully!')
  } catch (error) {
    console.error('Error generating sitemap:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

generateKunSitemap()
