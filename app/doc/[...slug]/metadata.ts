import { kunMoyuMoe } from '~/config/moyu-moe'
import { markdownToSeoDescription, toCanonicalUrl } from '~/utils/seo'
import type { Metadata } from 'next'
import type { KunBlog } from '~/lib/mdx/types'

export const generateKunMetadataTemplate = (blog: KunBlog): Metadata => {
  const { slug, content, frontmatter } = blog
  const description = markdownToSeoDescription(
    content,
    frontmatter.description || `${kunMoyuMoe.titleShort} 文章内容`
  )
  const canonical = toCanonicalUrl(`/doc/${slug}`)
  const title = `${frontmatter.title} - ${kunMoyuMoe.titleShort}`

  return {
    metadataBase: new URL(kunMoyuMoe.domain.main),
    title,
    description,
    keywords: [
      frontmatter.title,
      frontmatter.directoryLabel,
      frontmatter.category,
      ...kunMoyuMoe.keywords
    ].filter(Boolean),
    authors: frontmatter.authorName
      ? [{ name: frontmatter.authorName, url: canonical }]
      : kunMoyuMoe.author,
    openGraph: {
      url: canonical,
      title,
      description,
      siteName: kunMoyuMoe.titleShort,
      type: 'article',
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.date,
      images: [
        {
          url: frontmatter.banner,
          width: 1920,
          height: 1080,
          alt: frontmatter.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [frontmatter.banner]
    },
    alternates: {
      canonical
    }
  }
}
