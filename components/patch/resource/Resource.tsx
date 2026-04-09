'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { KunLoading } from '~/components/kun/Loading'
import { PublishedMarkdownPreview } from '~/components/kun/markdown/PublishedMarkdownPreview'
import { useUserStore } from '~/store/userStore'
import { kunFetchDelete, kunFetchGet } from '~/utils/kunFetch'
import type { PatchResource, PatchResourcePayload } from '~/types/api/patch'
import { EditResourceDialog } from './edit/EditResourceDialog'
import { PublishResource } from './publish/PublishResource'
import { ResourceTabs } from './Tabs'

interface Props {
  id: number
  mode?: 'public' | 'admin'
}

export const Resources = ({ id, mode = 'public' }: Props) => {
  const user = useUserStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [resources, setResources] = useState<PatchResource[]>([])
  const [resourceNote, setResourceNote] = useState('')
  const [editResource, setEditResource] = useState<PatchResource | null>(null)
  const [deleteResourceId, setDeleteResourceId] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await kunFetchGet<PatchResourcePayload>(
        '/patch/resource',
        {
          patchId: Number(id)
        }
      )
      setLoading(false)
      setResources(response.resources)
      setResourceNote(response.note)
    }

    void fetchData()
  }, [id])

  const {
    isOpen: isOpenCreate,
    onOpen: onOpenCreate,
    onClose: onCloseCreate
  } = useDisclosure()

  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit
  } = useDisclosure()

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete
  } = useDisclosure()

  const handleDeleteResource = async () => {
    setDeleting(true)

    await kunFetchDelete<KunResponse<{}>>('/patch/resource', {
      resourceId: deleteResourceId
    })

    setResources((previous) =>
      previous.filter((resource) => resource.id !== deleteResourceId)
    )
    setDeleteResourceId(0)
    setDeleting(false)
    onCloseDelete()
    toast.success('资源已删除')
  }

  const canManageResource = mode === 'admin' && user.role >= 2

  return (
    <div className="mt-4 space-y-4">
      {canManageResource ? (
        <div className="flex justify-end">
          <Button
            color="primary"
            variant="flat"
            startContent={<Plus className="size-4" />}
            onPress={onOpenCreate}
          >
            添加资源
          </Button>
        </div>
      ) : null}

      {loading ? (
        <KunLoading hint="正在获取游戏资源..." />
      ) : (
        <div className="space-y-4">
          {resources.length > 0 && resourceNote ? (
            <PublishedMarkdownPreview
              markdown={resourceNote}
              title=""
              emptyHint=""
              openLinksInNewTab
            />
          ) : null}

          <ResourceTabs
            resources={resources}
            canManage={canManageResource}
            setEditResource={setEditResource}
            onOpenEdit={onOpenEdit}
            onOpenDelete={onOpenDelete}
            setDeleteResourceId={setDeleteResourceId}
          />
        </div>
      )}

      {canManageResource ? (
        <>
          <Modal
            size="3xl"
            isOpen={isOpenCreate}
            onClose={onCloseCreate}
            scrollBehavior="outside"
            isDismissable={false}
            isKeyboardDismissDisabled={true}
          >
            <PublishResource
              patchId={id}
              onClose={onCloseCreate}
              onSuccess={(createdResources) => {
                setResources((previous) => [...previous, ...createdResources])
                onCloseCreate()
              }}
            />
          </Modal>

          <Modal
            size="3xl"
            isOpen={isOpenEdit}
            onClose={onCloseEdit}
            scrollBehavior="outside"
            isDismissable={false}
            isKeyboardDismissDisabled={true}
          >
            {editResource ? (
              <EditResourceDialog
                onClose={onCloseEdit}
                resource={editResource}
                onSuccess={(resource) => {
                  setResources((previousResources) =>
                    previousResources.map((previousResource) =>
                      previousResource.id === resource.id
                        ? resource
                        : previousResource
                    )
                  )
                  onCloseEdit()
                }}
              />
            ) : null}
          </Modal>

          <Modal
            isOpen={isOpenDelete}
            onClose={onCloseDelete}
            placement="center"
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                删除资源链接
              </ModalHeader>
              <ModalBody>
                <p>确认删除这条资源链接吗？此操作不可撤销。</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onCloseDelete}>
                  取消
                </Button>
                <Button
                  color="danger"
                  onPress={handleDeleteResource}
                  isLoading={deleting}
                  isDisabled={deleting}
                >
                  删除
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : null}
    </div>
  )
}
