'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from '@heroui/react'
import { Image } from '@heroui/image'
import { Edit2, ExternalLink, Trash2 } from 'lucide-react'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import {
  CONTENT_VISIBILITY_COLOR_MAP,
  CONTENT_VISIBILITY_LABEL_MAP
} from '~/constants/contentVisibility'
import type { AdminGalgame } from '~/types/api/admin'
import { kunFetchDelete } from '~/utils/kunFetch'
import { formatTimeDifference } from '~/utils/time'

const GalgameActions = ({
  galgame,
  onDeleted
}: {
  galgame: AdminGalgame
  onDeleted: (id: number) => void
}) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    const response = await kunFetchDelete<KunResponse<{}>>('/patch', {
      patchId: galgame.id
    })

    if (typeof response === 'string') {
      toast.error(response)
      setDeleting(false)
      return
    }

    toast.success('游戏已删除')
    onDeleted(galgame.id)
    setDeleting(false)
    onClose()
  }

  return (
    <>
      <div className="flex gap-2">
        <Tooltip content="编辑">
          <Button
            as={Link}
            href={`/admin/galgame/${galgame.uniqueId}`}
            isIconOnly
            size="sm"
            variant="light"
          >
            <Edit2 size={16} />
          </Button>
        </Tooltip>

        <Tooltip content="打开前台页面">
          <Button
            as={Link}
            href={`/${galgame.uniqueId}`}
            target="_blank"
            isIconOnly
            size="sm"
            variant="light"
          >
            <ExternalLink size={16} />
          </Button>
        </Tooltip>

        <Tooltip content="删除">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={onOpen}
          >
            <Trash2 size={16} />
          </Button>
        </Tooltip>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          <ModalHeader>删除游戏</ModalHeader>
          <ModalBody>
            确定要删除《{galgame.name}》吗？删除后会同步移除该游戏下的资源、评论及相关记录，且无法恢复。
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={deleting}
              isDisabled={deleting}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export const RenderCell = (
  galgame: AdminGalgame,
  columnKey: string,
  onDeleted: (id: number) => void
) => {
  switch (columnKey) {
    case 'id':
      return (
        <Chip size="sm" variant="flat" color="default">
          {galgame.id}
        </Chip>
      )
    case 'banner':
      return (
        <Image
          alt={galgame.name}
          className="object-cover"
          width={128}
          src={galgame.banner || '/favicon.ico'}
          style={{ aspectRatio: '16/9' }}
        />
      )
    case 'name':
      return (
        <div className="space-y-1">
          <Link
            href={`/admin/galgame/${galgame.uniqueId}`}
            className="font-medium hover:text-primary-500"
          >
            {galgame.name}
          </Link>
          <p className="text-xs text-default-500">{galgame.uniqueId}</p>
        </div>
      )
    case 'status':
      return (
        <Chip
          size="sm"
          variant="flat"
          color={CONTENT_VISIBILITY_COLOR_MAP[galgame.status] ?? 'default'}
        >
          {CONTENT_VISIBILITY_LABEL_MAP[galgame.status] ?? '未知'}
        </Chip>
      )
    case 'user':
      return (
        <KunUser
          user={galgame.user}
          userProps={{
            name: galgame.user.name,
            avatarProps: {
              src: galgame.user.avatar
            }
          }}
        />
      )
    case 'created':
      return (
        <span className="text-sm text-default-600">
          {formatTimeDifference(galgame.created)}
        </span>
      )
    case 'actions':
      return <GalgameActions galgame={galgame} onDeleted={onDeleted} />
    default:
      return null
  }
}
