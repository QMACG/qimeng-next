'use client'

import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useEffect, useState, type Key } from 'react'
import { useDebounce } from 'use-debounce'
import { KunLoading } from '~/components/kun/Loading'
import { KunPagination } from '~/components/kun/Pagination'
import { useMounted } from '~/hooks/useMounted'
import type { AdminGalgame } from '~/types/api/admin'
import { kunFetchGet } from '~/utils/kunFetch'
import { RenderCell } from './RenderCell'

type AdminGalgameStatus = 'all' | 'draft' | 'public' | 'hidden' | 'private'

const columns = [
  { name: 'ID', uid: 'id' },
  { name: '封面', uid: 'banner' },
  { name: '标题', uid: 'name' },
  { name: '状态', uid: 'status' },
  { name: '作者', uid: 'user' },
  { name: '发布时间', uid: 'publishedAt' },
  { name: '操作', uid: 'actions' }
]

const statusOptions: Array<{ key: AdminGalgameStatus; label: string }> = [
  { key: 'all', label: '全部状态' },
  { key: 'draft', label: '草稿' },
  { key: 'public', label: '公开' },
  { key: 'hidden', label: '隐藏' },
  { key: 'private', label: '私有' }
]

interface Props {
  initialGalgames: AdminGalgame[]
  initialTotal: number
}

export const Galgame = ({ initialGalgames, initialTotal }: Props) => {
  const [galgames, setGalgames] = useState<AdminGalgame[]>(initialGalgames)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState<AdminGalgameStatus>('all')
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const isMounted = useMounted()
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)

    const { galgames, total } = await kunFetchGet<{
      galgames: AdminGalgame[]
      total: number
    }>('/admin/galgame', {
      page,
      limit: 30,
      search: debouncedQuery,
      status
    })

    setLoading(false)
    setGalgames(galgames)
    setTotal(total)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    void fetchData()
  }, [page, debouncedQuery, status, isMounted])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleStatusChange = (keys: 'all' | Set<Key>) => {
    const key = Array.from(keys)[0] as AdminGalgameStatus | undefined
    if (!key) {
      return
    }

    setStatus(key)
    setPage(1)
  }

  const handleDeleted = (id: number) => {
    setGalgames((current) => current.filter((galgame) => galgame.id !== id))
    setTotal((current) => Math.max(0, current - 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">游戏管理</h1>
        </div>

        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat">
            共 {total} 条
          </Chip>
          <Button as={Link} href="/admin/galgame/new" color="primary">
            新建游戏
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <Input
          fullWidth
          isClearable
          placeholder="输入游戏 ID 或标题搜索"
          startContent={<Search className="text-default-300" size={20} />}
          value={searchQuery}
          onValueChange={handleSearch}
        />

        <Select
          aria-label="游戏状态筛选"
          className="w-full lg:max-w-56"
          selectedKeys={new Set([status])}
          onSelectionChange={handleStatusChange}
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      {loading ? (
        <KunLoading hint="正在获取游戏列表..." />
      ) : (
        <Table
          aria-label="游戏管理"
          bottomContent={
            <div className="flex w-full justify-center">
              <KunPagination
                page={page}
                total={Math.max(1, Math.ceil(total / 30))}
                onPageChange={setPage}
                isLoading={loading}
              />
            </div>
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.uid}>{column.name}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={galgames}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>
                    {RenderCell(item, columnKey.toString(), handleDeleted)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
