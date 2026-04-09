'use client'

import type { FC } from 'react'
import { KunHeader } from '../kun/Header'
import type { Company as CompanyType } from '~/types/api/company'

interface Props {
  setNewCompany: (company: CompanyType) => void
}

export const CompanyHeader: FC<Props> = ({ setNewCompany: _setNewCompany }) => {
  return (
    <KunHeader
      name="会社列表"
      description="这里收录与游戏相关的会社、品牌与基础资料。"
    />
  )
}
