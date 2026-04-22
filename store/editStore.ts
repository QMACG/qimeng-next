import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Company } from '~/types/api/company'

export interface CreatePatchData {
  name: string
  publishedAt: string
  introduction: string
  status: number
  tag: string[]
  companies: Company[]
  resourceNote: string
  released: string
  contentLimit: string
  banner: string
}

export interface CreatePatchResourceDraft {
  tempId: string
  name: string
  section: string
  storage: string
  content: string
  note: string
}

export type CreatePatchRequestData = CreatePatchData

interface StoreState {
  data: CreatePatchData
  resourceDrafts: CreatePatchResourceDraft[]
  getData: () => CreatePatchData
  setData: (data: CreatePatchData) => void
  setResourceDrafts: (resourceDrafts: CreatePatchResourceDraft[]) => void
  resetData: () => void
}

export const createPatchEditStoreKey = 'kun-patch-edit-store'

const initialState: CreatePatchData = {
  name: '',
  publishedAt: new Date().toISOString(),
  introduction: '',
  status: 1,
  tag: [],
  companies: [],
  resourceNote: '',
  released: '',
  contentLimit: 'sfw',
  banner: ''
}

export const useCreatePatchStore = create<StoreState>()(
  persist(
    (set, get) => ({
      data: initialState,
      resourceDrafts: [],
      getData: () => get().data,
      setData: (data: CreatePatchData) => set({ data }),
      setResourceDrafts: (resourceDrafts: CreatePatchResourceDraft[]) =>
        set({ resourceDrafts }),
      resetData: () => set({ data: initialState, resourceDrafts: [] })
    }),
    {
      name: createPatchEditStoreKey,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const typedState = (persistedState as Partial<StoreState>) ?? {}

        return {
          ...currentState,
          ...typedState,
          data: {
            ...currentState.data,
            ...(typedState.data ?? {})
          },
          resourceDrafts:
            typedState.resourceDrafts ?? currentState.resourceDrafts
        }
      }
    }
  )
)
