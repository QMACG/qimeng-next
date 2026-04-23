'use client'

import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  useDisclosure
} from '@heroui/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  RESOURCE_SECTION_MAP,
  SUPPORTED_RESOURCE_LINK_MAP
} from '~/constants/resource'
import { useCreatePatchStore } from '~/store/editStore'
import { ResourceDraftDialog } from './ResourceDraftDialog'
import type { CreatePatchResourceDraft } from '~/store/editStore'

export const ResourceDraftPanel = () => {
  const { resourceDrafts, setResourceDrafts } = useCreatePatchStore()
  const [editingDraft, setEditingDraft] =
    useState<CreatePatchResourceDraft | null>(null)
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

  const groupedCount = useMemo(
    () => ({
      netdisk: resourceDrafts.filter((item) => item.section === 'netdisk')
        .length,
      direct: resourceDrafts.filter((item) => item.section === 'direct').length
    }),
    [resourceDrafts]
  )

  const handleCreate = () => {
    setEditingDraft(null)
    onOpen()
  }

  const handleEdit = (draft: CreatePatchResourceDraft) => {
    setEditingDraft(draft)
    onOpen()
  }

  const handleDelete = (tempId: string) => {
    setResourceDrafts(resourceDrafts.filter((item) => item.tempId !== tempId))
  }

  const handleSubmit = (drafts: CreatePatchResourceDraft[]) => {
    const nextDrafts = editingDraft
      ? resourceDrafts.map((item) =>
          item.tempId === editingDraft.tempId ? drafts[0]! : item
        )
      : [...resourceDrafts, ...drafts]

    setResourceDrafts(nextDrafts)
    onClose()
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl">资源草稿</h2>
        </div>

        <Button
          color="primary"
          variant="flat"
          startContent={<Plus className="size-4" />}
          onPress={handleCreate}
        >
          添加资源
        </Button>
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Chip variant="flat" color="primary">
            共 {resourceDrafts.length} 条资源
          </Chip>
          <Chip variant="flat">网盘 {groupedCount.netdisk} 条</Chip>
          <Chip variant="flat">直链 {groupedCount.direct} 条</Chip>
        </div>

        {resourceDrafts.length ? (
          <div className="space-y-3">
            {resourceDrafts.map((draft, index) => (
              <div
                key={draft.tempId}
                className="rounded-xl border border-default-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-default-500">
                        资源 {index + 1}
                      </span>
                      <Chip size="sm" variant="flat">
                        {RESOURCE_SECTION_MAP[draft.section] ?? draft.section}
                      </Chip>
                      <Chip size="sm" variant="flat" color="secondary">
                        {SUPPORTED_RESOURCE_LINK_MAP[draft.storage] ??
                          draft.storage}
                      </Chip>
                    </div>

                    {draft.name ? (
                      <p className="font-medium text-default-800">
                        {draft.name}
                      </p>
                    ) : null}

                    <p className="break-all text-sm text-default-700">
                      {draft.content}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Pencil className="size-4" />}
                      onPress={() => handleEdit(draft)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<Trash2 className="size-4" />}
                      onPress={() => handleDelete(draft.tempId)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-default-300 p-6 text-sm text-default-500">
            还没有添加资源。
          </div>
        )}
      </CardBody>

      <Modal
        size="3xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        scrollBehavior="outside"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ResourceDraftDialog
          initialValue={editingDraft}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </Modal>
    </Card>
  )
}
