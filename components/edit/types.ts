import type { Company } from '~/types/api/company'

export interface PatchFormDataShape {
  name: string
  introduction: string
  tag: string[]
  companies?: Company[]
  resourceNote: string
  released: string
  banner?: string
}
