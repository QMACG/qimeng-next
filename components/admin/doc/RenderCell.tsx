'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import { Edit2, ExternalLink, Trash2 } from 'lucide-react'
import { formatDate } from '~/utils/time'
import { kunFetchDelete } from '~/utils/kunFetch'
import {
  CONTENT_VISIBILITY_COLOR_MAP,
  CONTENT_VISIBILITY_LABEL_MAP
} from '~/constants/contentVisibility'
import type { AdminDocPost } from '~/types/api/admin'

const getDocPath = (slug: string) => `/doc/${slug.replace(/^\/+/, '')}`

const getDirectoryPath = (slug: string, fallback = 'article') => {
  const segments = slug.split('/').filter(Boolean)
  return segments.slice(0, -1).join('/') || fallback
}

const getDirectoryLabel = (post: AdminDocPost) => {
  const label = post.directoryLabel
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .at(-1)

  return label || '文章'
}

const DocActions = ({
  post,
  onDeleted
}: {
  post: AdminDocPost
  onDeleted: (id: number) => void
}) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    const response = await kunFetchDelete<KunResponse<{}>>('/admin/doc', {
      id: post.id
    })

    if (typeof response === 'string') {
      toast.error(response)
      setDeleting(false)
      return
    }

    toast.success('文章已删除')
    onDeleted(post.id)
    setDeleting(false)
    onClose()
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          as={Link}
          href={`/admin/doc/${post.id}`}
          isIconOnly
          size="sm"
          variant="light"
        >
          <Edit2 size={16} />
        </Button>

        <Button
          as={Link}
          href={getDocPath(post.slug)}
          target="_blank"
          isIconOnly
          size="sm"
          variant="light"
        >
          <ExternalLink size={16} />
        </Button>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          onPress={onOpen}
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          <ModalHeader>删除文章</ModalHeader>
          <ModalBody>
            确定要删除《{post.title}》吗？删除后将无法恢复。
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
  post: AdminDocPost,
  columnKey: string,
  onDeleted: (id: number) => void
) => {
  switch (columnKey) {
    case 'title':
      return (
        <div className="space-y-1">
          <Link
            href={`/admin/doc/${post.id}`}
            className="font-medium hover:text-primary-500"
          >
            {post.title}
          </Link>
          <p className="text-xs text-default-500">{post.slug}</p>
        </div>
      )
    case 'directory':
      return (
        <div className="space-y-1">
          <p className="text-sm font-medium">{getDirectoryLabel(post)}</p>
          <p className="text-xs text-default-500">
            {getDirectoryPath(post.slug, post.category)}
          </p>
        </div>
      )
    case 'status':
      return (
        <Chip
          variant="flat"
          color={CONTENT_VISIBILITY_COLOR_MAP[post.status] ?? 'default'}
        >
          {CONTENT_VISIBILITY_LABEL_MAP[post.status] ?? '未知'}
        </Chip>
      )
    case 'publishedAt':
      return (
        <span className="text-sm text-default-600">
          {formatDate(post.publishedAt, {
            isPrecise: true,
            isShowYear: true
          })}
        </span>
      )
    case 'updated':
      return (
        <span className="text-sm text-default-600">
          {formatDate(post.updated, {
            isPrecise: true,
            isShowYear: true
          })}
        </span>
      )
    case 'actions':
      return <DocActions post={post} onDeleted={onDeleted} />
    default:
      return <Chip variant="flat">未知</Chip>
  }
}
