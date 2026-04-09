import { notFound, redirect } from 'next/navigation'
import { prisma } from '~/prisma/index'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { DocEditWorkspace } from '~/components/admin/doc/EditWorkspace'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminEditDocPage({ params }: Props) {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 2) {
    redirect('/')
  }

  const { id } = await params
  const numericId = Number.parseInt(id, 10)
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound()
  }

  const doc = await prisma.doc_post.findUnique({
    where: { id: numericId }
  })

  if (!doc) {
    notFound()
  }

  return (
    <DocEditWorkspace
      mode="edit"
      initialPost={{
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        banner: doc.banner,
        directoryLabel: doc.directory_label,
        description: doc.description,
        content: doc.content,
        category: doc.category,
        status: doc.visibility,
        pin: doc.pin,
        sortOrder: doc.sort_order,
        publishedAt: doc.published_at.toISOString(),
        authorName: doc.author_name,
        authorAvatar: doc.author_avatar,
        authorHomepage: doc.author_homepage,
        authorId: doc.author_id,
        created: doc.created.toISOString(),
        updated: doc.updated.toISOString()
      }}
    />
  )
}
