'use client'

import Link from 'next/link'
import { Button, Card, CardBody } from '@heroui/react'
import { ExternalLink, List } from 'lucide-react'
import { DocEditForm } from './EditForm'
import type { AdminDocPost } from '~/types/api/admin'

interface Props {
  mode: 'create' | 'edit'
  initialPost?: AdminDocPost
}

const getDocPath = (slug: string) => `/doc/${slug.replace(/^\/+/, '')}`

export const DocEditWorkspace = ({ mode, initialPost }: Props) => {
  const isEdit = mode === 'edit' && initialPost

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4">
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {isEdit ? '编辑文章' : '新建文章'}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              as={Link}
              href="/admin/doc"
              variant="flat"
              startContent={<List className="size-4" />}
            >
              返回列表
            </Button>

            {isEdit ? (
              <Button
                as={Link}
                href={getDocPath(initialPost.slug)}
                target="_blank"
                variant="flat"
                startContent={<ExternalLink className="size-4" />}
              >
                查看前台页面
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <DocEditForm mode={mode} initialPost={initialPost} />
    </div>
  )
}
