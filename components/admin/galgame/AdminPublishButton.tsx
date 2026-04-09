'use client'

import { useState } from 'react'
import { useRouter } from '@bprogress/next'
import { Button } from '@heroui/react'
import toast from 'react-hot-toast'
import { normalizeStringArray } from '~/utils/normalizeStringArray'
import { kunFetchFormData, kunFetchPost } from '~/utils/kunFetch'
import { patchCreateSchema } from '~/validations/edit'
import { cn } from '~/utils/cn'
import { useCreatePatchStore } from '~/store/editStore'
import type {
  CreatePatchRequestData,
  CreatePatchResourceDraft
} from '~/store/editStore'
import type { Dispatch, SetStateAction } from 'react'

interface Props {
  setErrors: Dispatch<
    SetStateAction<Partial<Record<keyof CreatePatchRequestData, string>>>
  >
  className?: string
}

interface CreatePatchResponse {
  uniqueId: string
  patchId: number
}

const appendPatchFormData = (
  formDataToSend: FormData,
  data: CreatePatchRequestData,
  sanitizedTag: string[]
) => {
  formDataToSend.append('banner', data.banner)
  formDataToSend.append('name', data.name)
  formDataToSend.append(
    'companyIds',
    JSON.stringify(data.companies.map((company) => company.id))
  )
  formDataToSend.append('introduction', data.introduction)
  formDataToSend.append('resourceNote', data.resourceNote)
  formDataToSend.append('tag', JSON.stringify(sanitizedTag))
  formDataToSend.append('status', String(data.status))
  formDataToSend.append('released', data.released)
  formDataToSend.append('contentLimit', data.contentLimit)
}

const createResources = async (
  patchId: number,
  resourceDrafts: CreatePatchResourceDraft[]
) => {
  const failedDrafts: string[] = []

  for (const draft of resourceDrafts) {
    const response = await kunFetchPost<KunResponse<{}>>('/patch/resource', {
      patchId,
      name: draft.name,
      section: draft.section,
      storage: draft.storage,
      content: draft.content,
      note: ''
    })

    if (typeof response === 'string') {
      failedDrafts.push(draft.content)
    }
  }

  return failedDrafts
}

export const AdminPublishButton = ({ setErrors, className }: Props) => {
  const router = useRouter()
  const { data, resourceDrafts, resetData } = useCreatePatchStore()
  const [creating, setCreating] = useState(false)

  const handleSubmit = async () => {
    const sanitizedTag = normalizeStringArray(data.tag)

    const result = patchCreateSchema.safeParse({
      ...data,
      tag: JSON.stringify(sanitizedTag),
      companyIds: JSON.stringify(data.companies.map((company) => company.id))
    })

    if (!result.success) {
      const newErrors: Partial<Record<keyof CreatePatchRequestData, string>> =
        {}

      result.error.errors.forEach((err) => {
        if (err.path.length) {
          newErrors[err.path[0] as keyof CreatePatchRequestData] = err.message
          toast.error(err.message)
        }
      })

      setErrors(newErrors)
      return
    }

    setErrors({})
    setCreating(true)
    toast('正在创建游戏...')

    try {
      const formDataToSend = new FormData()
      appendPatchFormData(formDataToSend, data, sanitizedTag)

      const response = await kunFetchFormData<KunResponse<CreatePatchResponse>>(
        '/edit',
        formDataToSend
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      if (resourceDrafts.length) {
        toast('正在保存资源...')
      }

      const failedDrafts = await createResources(response.patchId, resourceDrafts)
      resetData()

      if (failedDrafts.length) {
        toast.error(`游戏已创建，但有 ${failedDrafts.length} 条资源保存失败。`)
      } else {
        toast.success('游戏与资源已创建完成')
      }

      router.push(`/admin/galgame/${response.uniqueId}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Button
      color="primary"
      onPress={handleSubmit}
      className={cn('mt-4 w-full', className)}
      isDisabled={creating}
      isLoading={creating}
    >
      提交游戏与资源
    </Button>
  )
}
