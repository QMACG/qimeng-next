import { KunMasonryGrid } from '~/components/kun/MasonryGrid'
import { KunLoading } from '~/components/kun/Loading'
import { KunNull } from '~/components/kun/Null'
import { CompanyCard } from './Card'
import type { FC } from 'react'
import type { Company as CompanyType } from '~/types/api/company'

interface CompanyListProps {
  companies: CompanyType[]
  loading: boolean
  searching: boolean
}

export const CompanyList: FC<CompanyListProps> = ({
  companies,
  loading,
  searching
}) => {
  if (loading) {
    return <KunLoading hint="正在获取会社列表..." />
  }

  if (!searching && companies.length === 0) {
    return <KunNull message="暂未找到相关会社" />
  }

  return (
    <KunMasonryGrid columnWidth={256} gap={16}>
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </KunMasonryGrid>
  )
}
