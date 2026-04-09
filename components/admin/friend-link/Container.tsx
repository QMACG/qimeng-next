'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea
} from '@heroui/react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { kunFetchDelete, kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
import { formatDate } from '~/utils/time'
import { resolveFriendLinkAvatar } from '~/utils/friendLink'
import {
  FRIEND_LINK_STATUS,
  FRIEND_LINK_STATUS_COLOR_MAP,
  FRIEND_LINK_STATUS_LABEL_MAP,
  FRIEND_LINK_STATUS_OPTIONS
} from '~/constants/friend-link'
import type { FriendLinkItem } from '~/types/api/friend-link'

interface Props {
  initialLinks: FriendLinkItem[]
}

interface FriendLinkFormState {
  name: string
  avatar: string
  description: string
  link: string
  status: number
  sortOrder: number
}

const columns = [
  { name: '站点', uid: 'site' },
  { name: '状态', uid: 'status' },
  { name: '提交人', uid: 'applicant' },
  { name: '网址', uid: 'link' },
  { name: '排序', uid: 'sortOrder' },
  { name: '更新时间', uid: 'updated' },
  { name: '操作', uid: 'actions' }
]

const EMPTY_FORM: FriendLinkFormState = {
  name: '',
  avatar: '',
  description: '',
  link: '',
  status: FRIEND_LINK_STATUS.normal,
  sortOrder: 0
}

export const AdminFriendLinkContainer = ({ initialLinks }: Props) => {
  const [links, setLinks] = useState(initialLinks)
  const [editingLink, setEditingLink] = useState<FriendLinkItem | null>(null)
  const [form, setForm] = useState<FriendLinkFormState>(EMPTY_FORM)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingLink, setDeletingLink] = useState<FriendLinkItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const sortedLinks = useMemo(
    () =>
      [...links].sort(
        (a, b) =>
          a.status - b.status ||
          b.sortOrder - a.sortOrder ||
          new Date(b.updated).getTime() - new Date(a.updated).getTime()
      ),
    [links]
  )

  const openCreateModal = () => {
    setEditingLink(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEditModal = (link: FriendLinkItem) => {
    setEditingLink(link)
    setForm({
      name: link.name,
      avatar:
        link.avatar.startsWith('http') || link.avatar.startsWith('/')
          ? link.avatar
          : '',
      description: link.description,
      link: link.link,
      status: link.status,
      sortOrder: link.sortOrder
    })
    setModalOpen(true)
  }

  const upsertLink = (nextLink: FriendLinkItem) => {
    setLinks((current) => {
      const exists = current.some((item) => item.id === nextLink.id)
      if (!exists) {
        return [nextLink, ...current]
      }

      return current.map((item) => (item.id === nextLink.id ? nextLink : item))
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      const payload = {
        name: form.name,
        avatar: form.avatar,
        description: form.description,
        link: form.link,
        status: form.status,
        sortOrder: form.sortOrder
      }

      const response = editingLink
        ? await kunFetchPut<KunResponse<FriendLinkItem>>('/admin/friend-link', {
            id: editingLink.id,
            ...payload
          })
        : await kunFetchPost<KunResponse<FriendLinkItem>>(
            '/admin/friend-link',
            payload
          )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      upsertLink(response)
      setModalOpen(false)
      toast.success(editingLink ? '友情链接已更新' : '友情链接已添加')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingLink) {
      return
    }

    setDeleting(true)

    try {
      const response = await kunFetchDelete<KunResponse<{}>>(
        '/admin/friend-link',
        { id: deletingLink.id }
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setLinks((current) => current.filter((item) => item.id !== deletingLink.id))
      setDeleteModalOpen(false)
      setDeletingLink(null)
      toast.success('友情链接已删除')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">友链管理</h1>
          <p className="text-sm text-default-500">
            支持管理已上线友链、隐藏友链和用户提交的待审核友链。
          </p>
        </div>

        <Button
          color="primary"
          startContent={<Plus className="size-4" />}
          onPress={openCreateModal}
        >
          新建友链
        </Button>
      </div>

      <Table aria-label="友链管理">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
        </TableHeader>
        <TableBody items={sortedLinks}>
          {(item) => {
            const avatar = resolveFriendLinkAvatar(item.link, item.avatar)

            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl border border-divider bg-default-100">
                      <img
                        src={avatar}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-default-500">
                        {item.description || '未填写网站简介'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    color={FRIEND_LINK_STATUS_COLOR_MAP[item.status]}
                    variant="flat"
                    size="sm"
                  >
                    {FRIEND_LINK_STATUS_LABEL_MAP[item.status]}
                  </Chip>
                </TableCell>
                <TableCell>{item.applicantUserName || '后台创建'}</TableCell>
                <TableCell>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {item.link}
                  </a>
                </TableCell>
                <TableCell>{item.sortOrder}</TableCell>
                <TableCell>
                  {formatDate(item.updated, {
                    isShowYear: true,
                    isPrecise: true
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => openEditModal(item)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => {
                        setDeletingLink(item)
                        setDeleteModalOpen(true)
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>

      <Modal isOpen={modalOpen} onOpenChange={setModalOpen} placement="center">
        <ModalContent>
          <ModalHeader>{editingLink ? '编辑友链' : '新建友链'}</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="站点名称"
              labelPlacement="outside"
              placeholder="请输入站点名称"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <Input
              label="网站网址"
              labelPlacement="outside"
              placeholder="https://example.com"
              value={form.link}
              onChange={(event) =>
                setForm((current) => ({ ...current, link: event.target.value }))
              }
            />
            <Input
              label="网站图标"
              labelPlacement="outside"
              placeholder="留空时会优先尝试读取对方网站 favicon.ico"
              value={form.avatar}
              onChange={(event) =>
                setForm((current) => ({ ...current, avatar: event.target.value }))
              }
            />
            <Textarea
              label="网站简介"
              labelPlacement="outside"
              placeholder="请输入网站简介"
              minRows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
            />
            <Select
              label="友链状态"
              labelPlacement="outside"
              selectedKeys={new Set([String(form.status)])}
              onSelectionChange={(keys) => {
                const value = Number(Array.from(keys)[0] ?? FRIEND_LINK_STATUS.normal)
                setForm((current) => ({ ...current, status: value }))
              }}
            >
              {FRIEND_LINK_STATUS_OPTIONS.map((option) => (
                <SelectItem key={String(option.value)}>{option.label}</SelectItem>
              ))}
            </Select>
            <Input
              type="number"
              label="排序值"
              labelPlacement="outside"
              placeholder="数字越大越靠前"
              value={String(form.sortOrder)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value) || 0
                }))
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalOpen(false)}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={() => void handleSubmit()}
              isLoading={submitting}
              isDisabled={submitting}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteModalOpen(false)
            setDeletingLink(null)
          }
        }}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>删除友链</ModalHeader>
          <ModalBody>
            <p>
              确定要删除友情链接《{deletingLink?.name ?? ''}》吗？删除后将不会再在前台友情链接页面展示，且无法恢复。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                if (deleting) {
                  return
                }
                setDeleteModalOpen(false)
                setDeletingLink(null)
              }}
            >
              取消
            </Button>
            <Button
              color="danger"
              onPress={() => void handleDelete()}
              isLoading={deleting}
              isDisabled={deleting}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
