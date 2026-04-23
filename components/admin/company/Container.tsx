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
import { CompanyFormModal } from '~/components/company/form/CompanyFormModal'
import { kunFetchDelete, kunFetchGet, kunFetchPost } from '~/utils/kunFetch'
import type { Company, CompanyDetail } from '~/types/api/company'

interface Props {
  initialCompanies: Company[]
  initialTotal: number
  role?: number
}

const columns = [
  { name: '会社', uid: 'name' },
  { name: '关联游戏', uid: 'count' },
  { name: '别名', uid: 'alias' },
  { name: '操作', uid: 'actions' }
]

export const AdminCompanyContainer = ({
  initialCompanies,
  initialTotal,
  role = 3
}: Props) => {
  const [companies, setCompanies] = useState(initialCompanies)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 400)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CompanyDetail | null>(
    null
  )
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

  const fetchCompanies = async (nextPage = page, search = debouncedQuery) => {
    setLoading(true)

    try {
      if (search.trim()) {
        const response = await kunFetchPost<Company[]>('/company/search', {
          query: search
            .split(' ')
            .map((item) => item.trim())
            .filter(Boolean)
        })

        setCompanies(response)
        setTotal(response.length)
        return
      }

      const response = await kunFetchGet<{
        companies: Company[]
        total: number
      }>('/company/all', {
        page: nextPage,
        limit: 30
      })

      setCompanies(response.companies)
      setTotal(response.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchCompanies(page, debouncedQuery)
  }, [page, debouncedQuery])

  const handleOpenEdit = async (companyId: number) => {
    setLoading(true)
    try {
      const response = await kunFetchGet<KunResponse<CompanyDetail>>(
        '/company',
        {
          companyId
        }
      )
      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setEditingCompany(response)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDelete = (company: Company) => {
    setDeletingCompany(company)
    onOpen()
  }

  const handleDelete = async () => {
    if (!deletingCompany) {
      return
    }

    setDeleting(true)

    const response = await kunFetchDelete<KunResponse<{}>>('/company', {
      companyId: deletingCompany.id
    })

    if (typeof response === 'string') {
      toast.error(response)
      setDeleting(false)
      return
    }

    toast.success('会社已删除')
    setDeleting(false)
    setDeletingCompany(null)
    onClose()
    await fetchCompanies()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">会社管理</h1>
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
            新建会社
          </Button>
        </div>
      </div>

      <Input
        fullWidth
        isClearable
        placeholder="输入会社名、别名或母品牌搜索"
        startContent={<Search className="text-default-300" size={20} />}
        value={query}
        onValueChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
      />

      {loading ? (
        <KunLoading hint="正在加载会社列表..." />
      ) : (
        <Table
          aria-label="会社管理"
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
          <TableBody items={companies}>
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

      <CompanyFormModal
        type="create"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(company) => {
          setIsCreateOpen(false)
          setCompanies((current) => [company as Company, ...current])
          setTotal((current) => current + 1)
        }}
      />

      {editingCompany ? (
        <CompanyFormModal
          type="edit"
          company={editingCompany}
          isOpen={Boolean(editingCompany)}
          onClose={() => setEditingCompany(null)}
          onSuccess={(company) => {
            const nextCompany = company as CompanyDetail
            setEditingCompany(null)
            setCompanies((current) =>
              current.map((item) =>
                item.id === nextCompany.id
                  ? {
                      id: nextCompany.id,
                      name: nextCompany.name,
                      count: nextCompany.count,
                      alias: nextCompany.alias
                    }
                  : item
              )
            )
          }}
        />
      ) : null}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          <ModalHeader>删除会社</ModalHeader>
          <ModalBody>
            确定要删除《{deletingCompany?.name ?? ''}
            》吗？删除后会同步移除相关游戏上的会社关联，且无法恢复。
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
