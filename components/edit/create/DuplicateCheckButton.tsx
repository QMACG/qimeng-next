'use client'

import { useState } from 'react'
import { Button } from '@heroui/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createPatchEditStoreKey, useCreatePatchStore } from '~/store/editStore'
import { kunFetchGet } from '~/utils/kunFetch'

interface DuplicateResponse {
  uniqueId: string
}

export const DuplicateCheckButton = () => {
  const { data } = useCreatePatchStore()
  const [checking, setChecking] = useState(false)
  const [duplicateUniqueId, setDuplicateUniqueId] = useState<string | null>(
    null
  )

  const handleCheckDuplicate = async () => {
    const title = data.name.trim()

    if (!title) {
      toast.error('请先填写游戏标题后再查重')
      return
    }

    setChecking(true)
    setDuplicateUniqueId(null)

    try {
      const response = await kunFetchGet<KunResponse<DuplicateResponse>>(
        '/edit/duplicate',
        { title }
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      if (response?.uniqueId) {
        setDuplicateUniqueId(response.uniqueId)
        toast.error('发现同名游戏，请先检查是否已经存在')
      } else {
        toast.success('查重完成，未发现同名游戏')
      }
    } catch (error) {
      console.error(error)
      toast.error('查重失败，请稍后再试')
    } finally {
      setChecking(false)
    }
  }

  const handleClearDraft = async () => {
    localStorage.removeItem(createPatchEditStoreKey)
    window.location.reload()
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <Button
        color="secondary"
        size="sm"
        onPress={handleCheckDuplicate}
        isDisabled={checking}
        isLoading={checking}
      >
        检查重名
      </Button>

      <Button
        color="danger"
        variant="flat"
        size="sm"
        onPress={handleClearDraft}
      >
        清除本地草稿
      </Button>

      {duplicateUniqueId && (
        <Button
          as={Link}
          color="primary"
          target="_blank"
          href={`/${duplicateUniqueId}`}
          variant="flat"
          size="sm"
        >
          查看已有游戏
        </Button>
      )}
    </div>
  )
}
