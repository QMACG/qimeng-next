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
import { useMounted } from '~/hooks/useMounted'
import { KunLoading } from '~/components/kun/Loading'
import { KunPagination } from '~/components/kun/Pagination'
import { kunFetchGet } from '~/utils/kunFetch'
import { RenderCell } from './RenderCell'
import type { AdminDocPost } from '~/types/api/admin'

const columns = [
  { name: '标题', uid: 'title' },
  { name: '目录', uid: 'directory' },
  { name: '状态', uid: 'status' },
  { name: '发布时间', uid: 'publishedAt' },
  { name: '更新时间', uid: 'updated' },
  { name: '操作', uid: 'actions' }
]

interface Props {
  initialPosts: AdminDocPost[]
  initialTotal: number
}

export const DocContainer = ({ initialPosts, initialTotal }: Props) => {
  const [posts, setPosts] = useState<AdminDocPost[]>(initialPosts)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const isMounted = useMounted()
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)

    const response = await kunFetchGet<{
      posts: AdminDocPost[]
      total: number
    }>('/admin/doc', {
      page,
      limit: 30,
      search: debouncedQuery
    })

    setPosts(response.posts)
    setTotal(response.total)
    setLoading(false)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    void fetchData()
  }, [page, debouncedQuery, isMounted])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleDeleted = (id: number) => {
    setPosts((current) => current.filter((post) => post.id !== id))
    setTotal((current) => Math.max(0, current - 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">文章管理</h1>
        </div>

        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat">
            共 {total} 篇
          </Chip>
          <Button as={Link} href="/admin/doc/new" color="primary">
            新建文章
          </Button>
        </div>
      </div>

      <Input
        fullWidth
        isClearable
        placeholder="输入标题、目录、路径或摘要搜索文章"
        startContent={<Search className="text-default-300" size={20} />}
        value={searchQuery}
        onValueChange={handleSearch}
      />

      {loading ? (
        <KunLoading hint="正在加载文章列表..." />
      ) : (
        <Table
          aria-label="文章列表"
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
          <TableBody items={posts}>
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
