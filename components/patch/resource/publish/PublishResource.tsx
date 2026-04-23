'use client'

import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@heroui/button'
import {
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { patchResourceCreateSchema } from '~/validations/patch'
import { kunFetchPost } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'
import type { PatchResource } from '~/types/api/patch'
import {
  getDefaultResourceTitle,
  splitResourceLinks,
  syncResourceNames
} from '~/utils/resourceLinks'
import { ResourceLinksInput } from './ResourceLinksInput'
import { ResourceSectionSelect } from './ResourceSectionSelect'
import { ResourceTypeSelect } from './ResourceTypeSelect'

export type ResourceFormData = z.input<typeof patchResourceCreateSchema>

interface CreateResourceProps {
  patchId: number
  onClose: () => void
  onSuccess?: (resources: PatchResource[]) => void
}

export const PublishResource = ({
  patchId,
  onClose,
  onSuccess
}: CreateResourceProps) => {
  const [creating, setCreating] = useState(false)
  const [resourceNames, setResourceNames] = useState<string[]>([''])

  const {
    control,
    reset,
    setValue,
    formState: { errors },
    watch
  } = useForm<ResourceFormData>({
    resolver: zodResolver(patchResourceCreateSchema),
    defaultValues: {
      patchId,
      name: '',
      storage: 'baidu',
      section: 'netdisk',
      content: '',
      note: ''
    }
  })

  const section = watch('section')
  const storage = watch('storage')
  const content = watch('content')
  const singleName = watch('name')
  const directLinks = useMemo(() => splitResourceLinks(content), [content])

  useEffect(() => {
    if (section !== 'direct') {
      return
    }

    setResourceNames((current) => {
      const synced = syncResourceNames(current, directLinks.length || 1)
      if (synced.length === current.length) {
        const isSame = synced.every((item, index) => item === current[index])
        if (isSame) {
          return current
        }
      }

      return synced
    })
  }, [directLinks.length, section])

  const handleCreateResource = async () => {
    setCreating(true)

    try {
      if (section === 'direct' && directLinks.length > 1) {
        const successResources: PatchResource[] = []
        const failedMessages: string[] = []

        for (const [index, link] of directLinks.entries()) {
          const res = await kunFetchPost<KunResponse<PatchResource>>(
            '/patch/resource',
            {
              ...watch(),
              name:
                resourceNames[index]?.trim() ||
                getDefaultResourceTitle('direct', index),
              content: link,
              note: ''
            }
          )

          if (typeof res === 'string') {
            failedMessages.push(res)
          } else {
            successResources.push(res)
          }
        }

        if (successResources.length) {
          reset()
          setResourceNames([''])
          onSuccess?.(successResources)
        }

        if (failedMessages.length) {
          toast.error(
            `已成功添加 ${successResources.length} 条资源，另有 ${failedMessages.length} 条添加失败`
          )
          return
        }

        toast.success(`已添加 ${successResources.length} 条直链资源`)
        return
      }

      const res = await kunFetchPost<KunResponse<PatchResource>>(
        '/patch/resource',
        {
          ...watch(),
          note: ''
        }
      )

      kunErrorHandler(res, (value) => {
        reset()
        setResourceNames([''])
        onSuccess?.([value])
        toast.success('资源链接添加成功')
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <ModalContent>
      <ModalHeader className="flex-col space-y-2">
        <h3 className="text-lg">添加资源</h3>
      </ModalHeader>

      <ModalBody>
        <form className="space-y-6">
          <ResourceSectionSelect
            errors={errors}
            section={watch().section}
            setSection={(section) => {
              setValue('section', section)
              setValue('storage', section === 'direct' ? 'direct' : 'baidu')
            }}
          />

          <ResourceTypeSelect
            section={section}
            control={control}
            errors={errors}
          />

          {section === 'direct' && directLinks.length > 1 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">直链标题</h3>
              {directLinks.map((link, index) => (
                <div
                  key={`${link}-${index}`}
                  className="space-y-2 rounded-xl border border-default-200 p-3"
                >
                  <p className="break-all text-sm text-default-500">{link}</p>
                  <Input
                    label={`资源标题 ${index + 1}`}
                    labelPlacement="outside"
                    placeholder={`例如：直链线路 ${index + 1}`}
                    value={resourceNames[index] ?? ''}
                    onChange={(event) =>
                      setResourceNames((current) => {
                        const next = syncResourceNames(
                          current,
                          directLinks.length
                        )
                        next[index] = event.target.value
                        return next
                      })
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <Input
              label="资源标题"
              labelPlacement="outside"
              placeholder="可选，前台会显示在资源卡片中"
              value={singleName}
              onChange={(event) => setValue('name', event.target.value)}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />
          )}

          <ResourceLinksInput
            errors={errors}
            section={section}
            storage={storage}
            content={content}
            setContent={(content) => setValue('content', content)}
          />
        </form>
      </ModalBody>

      <ModalFooter className="flex-col items-end">
        <div className="space-x-2">
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="primary"
            isLoading={creating}
            isDisabled={creating}
            endContent={<Upload className="size-4" />}
            onPress={handleCreateResource}
          >
            提交资源
          </Button>
        </div>
      </ModalFooter>
    </ModalContent>
  )
}
