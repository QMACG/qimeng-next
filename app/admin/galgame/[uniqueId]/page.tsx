import { notFound, redirect } from 'next/navigation'
import { prisma } from '~/prisma/index'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { EditWorkspace } from '~/components/admin/galgame/EditWorkspace'
import { parseJsonStringArray } from '~/utils/prismaJson'

interface Props {
  params: Promise<{ uniqueId: string }>
}

export default async function AdminEditGalgamePage({ params }: Props) {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    redirect('/login')
  }
  if (payload.role < 2) {
    redirect('/')
  }

  const { uniqueId } = await params
  const patch = await prisma.patch.findUnique({
    where: { unique_id: uniqueId },
    include: {
      company: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              count: true,
              alias: true
            }
          }
        }
      },
      tag: {
        include: {
          tag: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })

  if (!patch) {
    notFound()
  }

  return (
    <EditWorkspace
      canDelete={payload.role >= 2}
      initialData={{
        id: patch.id,
        uniqueId: patch.unique_id,
        status: patch.visibility,
        banner: patch.banner,
        name: patch.name,
        introduction: patch.introduction,
        tag: patch.tag.map((item) => item.tag.name),
        companies: patch.company.map((item) => ({
          id: item.company.id,
          name: item.company.name,
          count: item.company.count,
          alias: parseJsonStringArray(item.company.alias)
        })),
        resourceNote: patch.resource_note,
        contentLimit: patch.content_limit,
        released: patch.released
      }}
    />
  )
}
