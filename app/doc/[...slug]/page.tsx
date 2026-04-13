import { notFound } from 'next/navigation'
import { getAdjacentPosts, getPostBySlug } from '~/lib/mdx/getPosts'
import { CustomMDX } from '~/lib/mdx/CustomMDX'
import { TableOfContents } from '~/components/doc/TableOfContents'
import { KunBottomNavigation } from '~/components/doc/Navigation'
import { generateKunMetadataTemplate } from './metadata'
import { BlogHeader } from '~/components/doc/BlogHeader'
import { FeedbackCommentSection } from '~/components/doc/feedback/Section'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { FEEDBACK_DOC_SLUG } from '~/constants/feedback'
import {
  buildBreadcrumbJsonLd,
  markdownToSeoDescription,
  serializeJsonLd,
  toCanonicalUrl
} from '~/utils/seo'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { getCommentAuditConfig } from '~/app/api/admin/comment/audit/_shared'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{
    slug: string[]
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const generateMetadata = async ({
  params
}: Props): Promise<Metadata> => {
  const { slug } = await params
  const url = slug.join('/')
  const payload = await verifyHeaderCookie()
  const blog = await getPostBySlug(url, {
    uid: payload?.uid,
    role: payload?.role
  })
  if (!blog) {
    return {}
  }

  return generateKunMetadataTemplate(blog)
}

export default async function Kun({ params }: Props) {
  const { slug } = await params
  const url = slug.join('/')
  const payload = await verifyHeaderCookie()
  const blog = await getPostBySlug(url, {
    uid: payload?.uid,
    role: payload?.role
  })

  if (!blog) {
    notFound()
  }

  const { content, frontmatter } = blog
  const { prev, next } = await getAdjacentPosts(url)
  const commentAuditConfig =
    blog.slug === FEEDBACK_DOC_SLUG ? await getCommentAuditConfig() : null
  const canonical = toCanonicalUrl(`/doc/${blog.slug}`)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    image: frontmatter.banner,
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    description: markdownToSeoDescription(
      content,
      frontmatter.description || `${kunMoyuMoe.titleShort} 文章内容`
    ),
    articleSection: frontmatter.directoryLabel,
    mainEntityOfPage: canonical,
    author: {
      '@type': 'Person',
      name: frontmatter.authorName || kunMoyuMoe.titleShort
    },
    publisher: {
      '@type': 'Organization',
      name: kunMoyuMoe.titleShort,
      logo: {
        '@type': 'ImageObject',
        url: toCanonicalUrl('/favicon.ico')
      }
    }
  }
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: kunMoyuMoe.titleShort, item: toCanonicalUrl('/') },
    { name: '文章', item: toCanonicalUrl('/doc') },
    { name: frontmatter.title, item: canonical }
  ])

  return (
    <div className="flex w-full">
      <div className="w-full px-3 sm:px-6 lg:w-[calc(100%-16rem)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
        />
        <BlogHeader frontmatter={frontmatter} />
        <article className="kun-prose">
          <CustomMDX source={content} />
        </article>
        {blog.slug === FEEDBACK_DOC_SLUG ? (
          <FeedbackCommentSection
            docPostId={blog.id}
            requireCaptcha={commentAuditConfig?.feedbackRequireCaptcha ?? false}
          />
        ) : null}
        <KunBottomNavigation prev={prev} next={next} />
      </div>

      <div>
        <TableOfContents />
      </div>
    </div>
  )
}
