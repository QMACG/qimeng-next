'use client'

import { Chip } from '@heroui/react'
import type { PatchFormDataShape } from '~/components/edit/types'

interface Props {
  data: PatchFormDataShape
}

export const CompanySummary = ({ data }: Props) => {
  const companies = data.companies ?? []

  if (!companies.length) return null

  return (
    <div className="w-full space-y-2">
      <h2 className="text-xl">已选会社</h2>
      <div className="flex flex-wrap gap-2">
        {companies.map((company) => (
          <Chip key={company.id} variant="flat" size="sm">
            {company.name}
          </Chip>
        ))}
      </div>
    </div>
  )
}
