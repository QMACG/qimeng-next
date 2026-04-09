'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, CardBody } from '@heroui/react'
import { ExternalLink } from 'lucide-react'
import { useRewritePatchStore } from '~/store/rewriteStore'
import { Resources } from '~/components/patch/resource/Resource'
import { EditForm } from './EditForm'
import { PatchDeleteButton } from './PatchDeleteButton'
import type { RewritePatchData } from '~/store/rewriteStore'

interface Props {
  initialData: RewritePatchData
  canDelete: boolean
}

export const EditWorkspace = ({ initialData, canDelete }: Props) => {
  const { setData } = useRewritePatchStore()

  useEffect(() => {
    setData(initialData)
  }, [initialData, setData])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4">
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">编辑游戏</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              as={Link}
              href={`/${initialData.uniqueId}`}
              target="_blank"
              variant="flat"
              startContent={<ExternalLink className="size-4" />}
            >
              查看前台页面
            </Button>
            {canDelete ? <PatchDeleteButton patchId={initialData.id} /> : null}
          </div>
        </CardBody>
      </Card>

      <EditForm />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-2xl font-semibold">资源</h2>
          <Resources id={initialData.id} mode="admin" />
        </CardBody>
      </Card>
    </div>
  )
}
