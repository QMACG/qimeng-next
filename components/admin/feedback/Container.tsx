'use client'

import { useEffect, useState, type Key } from 'react'
import { Chip, Input, Select, SelectItem } from '@heroui/react'
import { Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { KunLoading } from '~/components/kun/Loading'
import { KunNull } from '~/components/kun/Null'
import { KunPagination } from '~/components/kun/Pagination'
import { useMounted } from '~/hooks/useMounted'
import type { AdminFeedback } from '~/types/api/admin'
import { kunFetchGet } from '~/utils/kunFetch'
import { FeedbackCard } from './FeedbackCard'

type AdminFeedbackSearchType = 'content' | 'user'
type AdminFeedbackStatus =
  | 'all'
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'suspended'
  | 'closed'

const searchTypeOptions: Array<{
  key: AdminFeedbackSearchType
  label: string
  placeholder: string
}> = [
  {
    key: 'content',
    label: '反馈内容',
    placeholder: '输入反馈内容搜索'
  },
  {
    key: 'user',
    label: '用户',
    placeholder: '输入用户名搜索'
  }
]

const statusOptions: Array<{
  key: AdminFeedbackStatus
  label: string
}> = [
  { key: 'all', label: '全部状态' },
  { key: 'pending', label: '待处理' },
  { key: 'in_progress', label: '处理中' },
  { key: 'resolved', label: '已处理' },
  { key: 'suspended', label: '挂起' },
  { key: 'closed', label: '关闭' }
]

interface Props {
  initialFeedbacks: AdminFeedback[]
  total: number
}

export const Feedback = ({ initialFeedbacks, total }: Props) => {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>(initialFeedbacks)
  const [totalCount, setTotalCount] = useState(total)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] =
    useState<AdminFeedbackSearchType>('content')
  const [status, setStatus] = useState<AdminFeedbackStatus>('all')
  const [loading, setLoading] = useState(false)
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const isMounted = useMounted()

  const fetchData = async () => {
    setLoading(true)

    try {
      const response = await kunFetchGet<{
        feedbacks: AdminFeedback[]
        total: number
      }>('/admin/feedback', {
        page,
        limit: 30,
        search: debouncedQuery,
        searchType,
        status
      })

      const totalPage = Math.max(1, Math.ceil(response.total / 30))
      if (page > totalPage) {
        setPage(totalPage)
        return
      }

      setFeedbacks(response.feedbacks)
      setTotalCount(response.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    void fetchData()
  }, [isMounted, page, debouncedQuery, searchType, status])

  const handleSearchTypeChange = (keys: 'all' | Set<Key>) => {
    const key = Array.from(keys)[0] as AdminFeedbackSearchType | undefined
    if (!key) {
      return
    }

    setSearchType(key)
    setPage(1)
  }

  const handleStatusChange = (keys: 'all' | Set<Key>) => {
    const key = Array.from(keys)[0] as AdminFeedbackStatus | undefined
    if (!key) {
      return
    }

    setStatus(key)
    setPage(1)
  }

  const currentPlaceholder =
    searchTypeOptions.find((option) => option.key === searchType)?.placeholder ??
    '输入反馈内容搜索'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">反馈管理</h1>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row xl:flex-1">
          <Select
            aria-label="搜索类型"
            className="w-full sm:max-w-40"
            selectedKeys={new Set([searchType])}
            onSelectionChange={handleSearchTypeChange}
          >
            {searchTypeOptions.map((option) => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            ))}
          </Select>

          <Input
            fullWidth
            isClearable
            placeholder={currentPlaceholder}
            startContent={<Search className="text-default-300" size={20} />}
            value={searchQuery}
            onValueChange={(value) => {
              setSearchQuery(value)
              setPage(1)
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="处理状态"
            className="w-full sm:w-44"
            selectedKeys={new Set([status])}
            onSelectionChange={handleStatusChange}
          >
            {statusOptions.map((option) => (
              <SelectItem key={option.key}>{option.label}</SelectItem>
            ))}
          </Select>

          <Chip color="primary" variant="flat">
            共 {totalCount} 条
          </Chip>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <KunLoading hint="正在获取反馈数据..." />
        ) : feedbacks.length ? (
          feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              onHandled={() => void fetchData()}
            />
          ))
        ) : (
          <KunNull message="当前没有符合条件的反馈" />
        )}
      </div>

      <div className="flex justify-center">
        <KunPagination
          total={Math.max(1, Math.ceil(totalCount / 30))}
          page={page}
          onPageChange={setPage}
          isLoading={loading}
        />
      </div>
    </div>
  )
}
