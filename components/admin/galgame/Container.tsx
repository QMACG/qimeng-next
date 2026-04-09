'use client'

import {
  Button,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { RenderCell } from './RenderCell'
import { kunFetchGet } from '~/utils/kunFetch'
import { KunLoading } from '~/components/kun/Loading'
import { useMounted } from '~/hooks/useMounted'
import { KunPagination } from '~/components/kun/Pagination'
import type { AdminGalgame } from '~/types/api/admin'

const columns = [
  { name: 'ID', uid: 'id' },
  { name: '封面', uid: 'banner' },
  { name: '标题', uid: 'name' },
  { name: '状态', uid: 'status' },
  { name: '作者', uid: 'user' },
  { name: '创建时间', uid: 'created' },
  { name: '操作', uid: 'actions' }
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
      search: debouncedQuery
    })

    setLoading(false)
    setGalgames(galgames)
    setTotal(total)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    fetchData()
  }, [page, debouncedQuery, isMounted])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
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

      <Input
        fullWidth
        isClearable
        placeholder="输入游戏名称搜索"
        startContent={<Search className="text-default-300" size={20} />}
        value={searchQuery}
        onValueChange={handleSearch}
      />

      {loading ? (
        <KunLoading hint="正在获取游戏列表..." />
      ) : (
        <Table
          aria-label="游戏管理"
          bottomContent={
            <div className="flex w-full justify-center">
              <KunPagination
                page={page}
                total={Math.ceil(total / 30)}
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
                  <TableCell>{RenderCell(item, columnKey.toString())}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
