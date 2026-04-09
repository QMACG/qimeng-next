'use client'

import { Chip } from '@heroui/chip'
import { Tooltip } from '@heroui/tooltip'
import { Link } from '@heroui/link'
import type { FC } from 'react'
import type { Company } from '~/types/api/company'

interface Props {
  initialCompanies: Company[]
}

export const PatchCompany: FC<Props> = ({ initialCompanies }) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-medium">所属会社</h2>
      </div>

      <div className="space-x-2">
        {initialCompanies.map((company) => (
          <Tooltip
            key={company.id}
            content={`${company.count} 个游戏归属于该会社`}
          >
            <Link href={`/company/${company.id}`}>
              <Chip color="secondary" variant="flat">
                {company.name}
                {` +${company.count}`}
              </Chip>
            </Link>
          </Tooltip>
        ))}

        {!initialCompanies.length && <Chip>当前游戏暂未关联会社信息</Chip>}
      </div>
    </div>
  )
}
