'use client'

import { useEffect, useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure
} from '@heroui/react'
import { Edit2, Plus, Search, Trash2 } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { KunLoading } from '~/components/kun/Loading'
import { KunPagination } from '~/components/kun/Pagination'
import { CreateTagModal } from '~/components/tag/CreateTagModal'
import { EditTagModal } from '~/components/tag/detail/EditTagModal'
import { kunFetchDelete, kunFetchGet, kunFetchPost } from '~/utils/kunFetch'
import type { Tag, TagDetail } from '~/types/api/tag'

interface Props {
  initialTags: Tag[]
  initialTotal: number
  role: number
}

const columns = [
  { name: '标签', uid: 'name' },
  { name: '关联游戏', uid: 'count' },
  { name: '别名', uid: 'alias' },
  { name: '操作', uid: 'actions' }
]

export const AdminTagContainer = ({
  initialTags,
  initialTotal,
  role
}: Props) => {
  const [tags, setTags] = useState(initialTags)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 400)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagDetail | null>(null)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

  const fetchTags = async (nextPage = page, search = debouncedQuery) => {
    setLoading(true)

    try {
      if (search.trim()) {
        const response = await kunFetchPost<(Tag & { type?: string })[]>(
          '/search/tag',
          {
            query: search
              .split(' ')
              .map((item) => item.trim())
              .filter(Boolean)
          }
        )

        setTags(response.map(({ type: _type, ...tag }) => tag))
        setTotal(response.length)
        return
      }

      const response = await kunFetchGet<{ tags: Tag[]; total: number }>(
        '/tag/all',
        {
          page: nextPage,
          limit: 30
        }
      )

      setTags(response.tags)
      setTotal(response.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTags(page, debouncedQuery)
  }, [page, debouncedQuery])

  const handleOpenEdit = async (tagId: number) => {
    setLoading(true)
    try {
      const response = await kunFetchGet<KunResponse<TagDetail>>('/tag', {
        tagId
      })
      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setEditingTag(response)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDelete = (tag: Tag) => {
    setDeletingTag(tag)
    onOpen()
  }

  const handleDelete = async () => {
    if (!deletingTag) {
      return
    }

    setDeleting(true)

    const response = await kunFetchDelete<KunResponse<{}>>('/tag', {
      tagId: deletingTag.id
    })

    if (typeof response === 'string') {
      toast.error(response)
      setDeleting(false)
      return
    }

    toast.success('标签已删除')
    setDeleting(false)
    setDeletingTag(null)
    onClose()
    await fetchTags()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">标签管理</h1>
        </div>

        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat">
            共 {total} 个
          </Chip>
          <Button
            color="primary"
            startContent={<Plus className="size-4" />}
            onPress={() => setIsCreateOpen(true)}
          >
            新建标签
          </Button>
        </div>
      </div>

      <Input
        fullWidth
        isClearable
        placeholder="输入标签名或别名搜索"
        startContent={<Search className="text-default-300" size={20} />}
        value={query}
        onValueChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
      />

      {loading ? (
        <KunLoading hint="正在加载标签列表..." />
      ) : (
        <Table
          aria-label="标签管理"
          bottomContent={
            !query.trim() ? (
              <div className="flex w-full justify-center">
                <KunPagination
                  page={page}
                  total={Math.ceil(total / 30)}
                  onPageChange={setPage}
                  isLoading={loading}
                />
              </div>
            ) : undefined
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.uid}>{column.name}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={tags}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {item.alias.length ? (
                      item.alias.map((alias) => (
                        <Chip key={alias} size="sm" variant="flat">
                          {alias}
                        </Chip>
                      ))
                    ) : (
                      <span className="text-sm text-default-500">无</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => void handleOpenEdit(item.id)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    {role >= 3 ? (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleOpenDelete(item)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <CreateTagModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(tag) => {
          setIsCreateOpen(false)
          setTags((current) => [tag, ...current])
          setTotal((current) => current + 1)
        }}
      />

      {editingTag ? (
        <EditTagModal
          tag={editingTag}
          isOpen={Boolean(editingTag)}
          onClose={() => setEditingTag(null)}
          onSuccess={(tag) => {
            setEditingTag(null)
            setTags((current) =>
              current.map((item) =>
                item.id === tag.id
                  ? {
                      id: tag.id,
                      name: tag.name,
                      count: tag.count,
                      alias: tag.alias
                    }
                  : item
              )
            )
          }}
        />
      ) : null}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          <ModalHeader>删除标签</ModalHeader>
          <ModalBody>
            确定要删除标签《{deletingTag?.name ?? ''}
            》吗？删除后会同步移除相关游戏上的该标签，且无法恢复。
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
    </div>
  )
}
