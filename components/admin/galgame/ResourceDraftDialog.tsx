'use client'

import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@heroui/button'
import {
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react'
import { patchResourceCreateSchema } from '~/validations/patch'
import { ResourceLinksInput } from '~/components/patch/resource/publish/ResourceLinksInput'
import { ResourceSectionSelect } from '~/components/patch/resource/publish/ResourceSectionSelect'
import { ResourceTypeSelect } from '~/components/patch/resource/publish/ResourceTypeSelect'
import type { CreatePatchResourceDraft } from '~/store/editStore'
import {
  getDefaultResourceTitle,
  splitResourceLinks,
  syncResourceNames
} from '~/utils/resourceLinks'

const resourceDraftSchema = patchResourceCreateSchema.omit({
  patchId: true
})

type ResourceDraftFormData = z.input<typeof resourceDraftSchema>

interface Props {
  initialValue?: CreatePatchResourceDraft | null
  onClose: () => void
  onSubmit: (value: CreatePatchResourceDraft[]) => void
}

const createTempId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const ResourceDraftDialog = ({
  initialValue,
  onClose,
  onSubmit
}: Props) => {
  const isEditMode = Boolean(initialValue)
  const [resourceNames, setResourceNames] = useState<string[]>([
    initialValue?.name ?? ''
  ])

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResourceDraftFormData>({
    resolver: zodResolver(resourceDraftSchema),
    defaultValues: initialValue ?? {
      name: '',
      section: 'netdisk',
      storage: 'baidu',
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

  const submitDraft = handleSubmit((value) => {
    if (value.section === 'direct' && directLinks.length > 1) {
      onSubmit(
        directLinks.map((link, index) => ({
          tempId: createTempId(),
          name:
            resourceNames[index]?.trim() || getDefaultResourceTitle('direct', index),
          section: value.section,
          storage: value.storage,
          content: link,
          note: ''
        }))
      )
      return
    }

    onSubmit([
      {
        tempId: initialValue?.tempId ?? createTempId(),
        name: (value.name ?? '').trim(),
        section: value.section,
        storage: value.storage,
        content: value.content.trim(),
        note: ''
      }
    ])
  })

  return (
    <ModalContent>
      <ModalHeader className="flex-col space-y-2">
        <h3 className="text-lg">{isEditMode ? '编辑资源草稿' : '添加资源草稿'}</h3>
      </ModalHeader>

      <ModalBody>
        <form className="space-y-6" onSubmit={submitDraft}>
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
                <div key={`${link}-${index}`} className="space-y-2 rounded-xl border border-default-200 p-3">
                  <p className="break-all text-sm text-default-500">{link}</p>
                  <Input
                    label={`资源标题 ${index + 1}`}
                    labelPlacement="outside"
                    placeholder={`例如：直链线路 ${index + 1}`}
                    value={resourceNames[index] ?? ''}
                    onChange={(event) =>
                      setResourceNames((current) => {
                        const next = syncResourceNames(current, directLinks.length)
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

      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          取消
        </Button>
        <Button
          color="primary"
          onPress={() => {
            void submitDraft()
          }}
        >
          {isEditMode ? '保存' : '添加'}
        </Button>
      </ModalFooter>
    </ModalContent>
  )
}
