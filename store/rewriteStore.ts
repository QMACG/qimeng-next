import { create } from 'zustand'
import type { Company } from '~/types/api/company'

export interface RewritePatchData {
  id: number
  uniqueId: string
  publishedAt: string
  status: number
  banner: string
  name: string
  introduction: string
  tag: string[]
  companies: Company[]
  resourceNote: string
  contentLimit: string
  released: string
}

interface StoreState {
  data: RewritePatchData
  getData: () => RewritePatchData
  setData: (data: RewritePatchData) => void
  resetData: () => void
}

const initialState: RewritePatchData = {
  id: 0,
  uniqueId: '',
  publishedAt: new Date().toISOString(),
  status: 1,
  banner: '',
  name: '',
  introduction: '',
  tag: [],
  companies: [],
  resourceNote: '',
  contentLimit: 'sfw',
  released: ''
}

export const useRewritePatchStore = create<StoreState>()((set, get) => ({
  data: initialState,
  getData: () => get().data,
  setData: (data: RewritePatchData) => set({ data }),
  resetData: () => set({ data: initialState })
}))
