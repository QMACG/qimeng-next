'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  ScrollShadow
} from '@heroui/react'
import { Building2, Plus, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDebounce } from 'use-debounce'
import { kunFetchGet, kunFetchPost } from '~/utils/kunFetch'
import type { Company } from '~/types/api/company'

interface Props {
  companies: Company[]
  onChange: (companies: Company[]) => void
}

const dedupeCompanies = (companies: Company[]) => {
  const map = new Map<number, Company>()
  companies.forEach((company) => {
    map.set(company.id, company)
  })
  return Array.from(map.values())
}

export const CompanySelector = ({ companies, onChange }: Props) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [debouncedQuery] = useDebounce(query, 300)

  const normalizedQuery = query.trim()
  const selectedIds = useMemo(
    () => new Set(companies.map((company) => company.id)),
    [companies]
  )

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const response = await kunFetchPost<Company[]>('/company/search', {
          query: debouncedQuery
            .split(' ')
            .map((item) => item.trim())
            .filter(Boolean)
        })
        setResults(response)
      } finally {
        setLoading(false)
      }
    }

    void fetchCompanies()
  }, [debouncedQuery])

  const canQuickCreate =
    Boolean(normalizedQuery) &&
    !results.some(
      (company) =>
        company.name.trim().toLowerCase() === normalizedQuery.toLowerCase()
    )

  const handleSelect = (company: Company) => {
    onChange(dedupeCompanies([...companies, company]))
  }

  const handleRemove = (companyId: number) => {
    onChange(companies.filter((company) => company.id !== companyId))
  }

  const handleQuickCreate = async () => {
    if (!normalizedQuery) {
      return
    }

    setCreating(true)

    try {
      const response = await kunFetchPost<KunResponse<Company>>('/company', {
        name: normalizedQuery,
        introduction: '',
        alias: [],
        primary_language: [],
        official_website: [],
        parent_brand: []
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      const nextCompanies = dedupeCompanies([response, ...results])
      setResults(nextCompanies)
      handleSelect(response)
      setQuery('')
      toast.success('会社已创建并关联到当前游戏')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card className="border border-divider bg-content1/40 shadow-none">
      <CardBody className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl">所属会社</h2>
          </div>

          <Button
            as={Link}
            href="/admin/company"
            variant="flat"
            startContent={<Building2 className="size-4" />}
          >
            管理会社
          </Button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={query}
            onValueChange={setQuery}
            placeholder="搜索会社名称，或直接输入新会社名称"
            startContent={<Search className="size-4 text-default-400" />}
          />

          <Button
            color="primary"
            variant="flat"
            startContent={<Plus className="size-4" />}
            onPress={handleQuickCreate}
            isLoading={creating}
            isDisabled={!canQuickCreate || creating}
          >
            新建并关联
          </Button>
        </div>

        {companies.length ? (
          <div className="flex flex-wrap gap-2">
            {companies.map((company) => (
              <Chip
                key={company.id}
                variant="flat"
                color="primary"
                onClose={() => handleRemove(company.id)}
              >
                {company.name}
              </Chip>
            ))}
          </div>
        ) : (
          <p className="text-sm text-default-500">暂未选择会社</p>
        )}

        {normalizedQuery ? (
          <ScrollShadow className="max-h-72">
            <div className="space-y-2">
              {loading ? (
                <p className="py-6 text-center text-sm text-default-500">
                  正在搜索会社...
                </p>
              ) : results.length ? (
                results.map((company) => {
                  const selected = selectedIds.has(company.id)

                  return (
                    <div
                      key={company.id}
                      className="flex items-center justify-between rounded-large border border-divider px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{company.name}</p>
                        <p className="text-xs text-default-500">
                          关联 {company.count} 部游戏
                        </p>
                      </div>

                      {selected ? (
                        <Button
                          color="danger"
                          variant="light"
                          startContent={<X className="size-4" />}
                          onPress={() => handleRemove(company.id)}
                        >
                          移除
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          variant="flat"
                          onPress={() => handleSelect(company)}
                        >
                          选择
                        </Button>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="py-6 text-center text-sm text-default-500">
                  没有找到相关会社
                </p>
              )}
            </div>
          </ScrollShadow>
        ) : (
          <p className="text-sm text-default-500">
            输入会社名称后，会在这里显示候选结果。
          </p>
        )}
      </CardBody>
    </Card>
  )
}
