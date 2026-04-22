'use client'

import { useEffect, useState } from 'react'
import { Chip } from '@heroui/react'
import { useMounted } from '~/hooks/useMounted'
import { useSyncedGalgameListQuery } from '~/hooks/useSyncedGalgameListQuery'
import { KunHeader } from '~/components/kun/Header'
import { KunUser } from '~/components/kun/floating-card/KunUser'
import { KunLoading } from '~/components/kun/Loading'
import { GalgameCard } from '~/components/galgame/Card'
import { KunNull } from '~/components/kun/Null'
import { KunPagination } from '~/components/kun/Pagination'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { formatTimeDifference } from '~/utils/time'
import { kunFetchGet } from '~/utils/kunFetch'
import { SUPPORTED_LANGUAGE_MAP } from '~/constants/resource'
import { FilterBar } from '~/components/galgame/FilterBar'
import type { CompanyDetail } from '~/types/api/company'
import type { SortField, SortOrder } from '~/components/galgame/_sort'
import type { FC } from 'react'
import { errorReporter, kunErrorHandler } from '~/utils/kunErrorHandler'

interface Props {
  initialCompany: CompanyDetail
  initialPatches: GalgameCard[]
  total: number
  initialPage: number
  initialSortField: SortField
  initialSortOrder: SortOrder
}

export const CompanyDetailContainer: FC<Props> = ({
  initialCompany,
  initialPatches,
  total,
  initialPage,
  initialSortField,
  initialSortOrder
}) => {
  const isMounted = useMounted()
  const {
    page,
    setPage,
    sortField,
    sortOrder,
    setSortFieldWithPageReset,
    setSortOrderWithPageReset
  } = useSyncedGalgameListQuery({
    initialPage,
    initialSortField,
    initialSortOrder
  })

  const [company] = useState(initialCompany)
  const [patches, setPatches] = useState<GalgameCard[]>(initialPatches)
  const [totalCount, setTotalCount] = useState(total)
  const [loading, setLoading] = useState(false)

  const fetchPatches = async () => {
    setLoading(true)

    try {
      const response = await kunFetchGet<
        | {
            galgames: GalgameCard[]
            total: number
          }
        | string
      >('/company/galgame', {
        companyId: company.id,
        page,
        limit: 24,
        sortField,
        sortOrder
      })

      if (typeof response === 'string') {
        kunErrorHandler(response, () => {})
        setPatches([])
        setTotalCount(0)
        return
      }

      setPatches(response.galgames)
      setTotalCount(response.total)
    } catch (error) {
      setPatches([])
      setTotalCount(0)
      errorReporter(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }
    fetchPatches()
  }, [page, sortField, sortOrder])

  return (
    <div className="my-4 w-full space-y-6">
      <KunHeader
        name={company.name}
        description={company.introduction}
        headerEndContent={
          <Chip size="lg" color="primary">
            {company.count} 部作品
          </Chip>
        }
        endContent={
          <div className="mb-4 flex justify-between">
            <KunUser
              user={company.user}
              userProps={{
                name: company.user.name,
                description: `创建于 ${formatTimeDifference(company.created)}`,
                avatarProps: {
                  src: company.user?.avatar
                }
              }}
            />
          </div>
        }
      />

      {company.alias.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">别名</h2>
          <div className="flex flex-wrap gap-2">
            {company.alias.map((alias, index) => (
              <Chip key={index} variant="flat" color="secondary">
                {alias}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {company.official_website.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">官网链接</h2>
          <div className="flex flex-wrap gap-2">
            {company.official_website.map((site, index) => (
              <KunExternalLink link={site} key={index}>
                {site}
              </KunExternalLink>
            ))}
          </div>
        </div>
      )}

      {company.primary_language.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">主要语言</h2>
          <div className="flex flex-wrap gap-2">
            {company.primary_language.map((language, index) => (
              <Chip key={index} variant="flat" color="success">
                {SUPPORTED_LANGUAGE_MAP[language]}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <FilterBar
        sortField={sortField}
        setSortField={setSortFieldWithPageReset}
        sortOrder={sortOrder}
        setSortOrder={setSortOrderWithPageReset}
      />

      {company.parent_brand.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">上级品牌</h2>
          <div className="flex flex-wrap gap-2">
            {company.parent_brand.map((brand, index) => (
              <Chip key={index} variant="flat" color="primary">
                {brand}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <KunLoading hint="正在加载作品..." />
      ) : (
        <div>
          <div className="mx-auto mb-8 grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {patches.map((patch) => (
              <GalgameCard key={patch.id} patch={patch} />
            ))}
          </div>

          {totalCount > 24 && (
            <div className="flex justify-center">
              <KunPagination
                total={Math.ceil(totalCount / 24)}
                page={page}
                onPageChange={setPage}
                isLoading={loading}
              />
            </div>
          )}

          {!totalCount && <KunNull message="暂无相关作品" />}
        </div>
      )}
    </div>
  )
}
