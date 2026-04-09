'use client'

import { useState } from 'react'
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
import toast from 'react-hot-toast'
import { patchResourceCreateSchema } from '~/validations/patch'
import { kunFetchPut } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'
import type { PatchResource } from '~/types/api/patch'
import { ResourceLinksInput } from '../publish/ResourceLinksInput'
import { ResourceSectionSelect } from '../publish/ResourceSectionSelect'
import { ResourceTypeSelect } from '../publish/ResourceTypeSelect'

type EditResourceFormData = z.input<typeof patchResourceCreateSchema>

interface EditResourceDialogProps {
  resource: PatchResource
  onClose: () => void
  onSuccess: (resource: PatchResource) => void
  type?: 'patch' | 'admin'
}

export const EditResourceDialog = ({
  resource,
  onClose,
  onSuccess,
  type = 'patch'
}: EditResourceDialogProps) => {
  const [editing, setEditing] = useState(false)

  const {
    control,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EditResourceFormData>({
    resolver: zodResolver(patchResourceCreateSchema),
    defaultValues: {
      patchId: resource.patchId,
      name: resource.name,
      section: resource.section,
      storage: resource.storage,
      content: resource.content,
      note: ''
    }
  })

  const handleUpdateResource = async () => {
    setEditing(true)

    const res = await kunFetchPut<KunResponse<PatchResource>>(
      `/${type}/resource`,
      { resourceId: resource.id, ...watch(), note: '' }
    )

    kunErrorHandler(res, (value) => {
      reset()
      onSuccess(value)
      toast.success('资源更新成功')
    })

    setEditing(false)
  }

  return (
    <ModalContent>
      <ModalHeader className="flex-col space-y-2">
        <h3 className="text-lg">修改资源</h3>
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
            section={watch().section}
            control={control}
            errors={errors}
          />

          <Input
            label="资源标题"
            labelPlacement="outside"
            placeholder="可选，前台会显示在资源卡片中"
            value={watch().name}
            onChange={(event) => setValue('name', event.target.value)}
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
          />

          <ResourceLinksInput
            errors={errors}
            section={watch().section}
            storage={watch().storage}
            content={watch().content}
            setContent={(content) => setValue('content', content)}
          />
        </form>
      </ModalBody>

      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>
          取消
        </Button>
        <Button
          color="primary"
          isLoading={editing}
          isDisabled={editing}
          onPress={handleUpdateResource}
        >
          保存
        </Button>
      </ModalFooter>
    </ModalContent>
  )
}
