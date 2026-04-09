'use client'

import { z } from 'zod'
import { Controller } from 'react-hook-form'
import { Select, SelectItem } from '@heroui/select'
import { patchResourceCreateSchema } from '~/validations/patch'
import {
  DIRECT_STORAGE_TYPES,
  NETDISK_STORAGE_TYPES
} from '~/constants/resource'
import type { ControlType, ErrorType } from '../share'

export type ResourceFormData = z.input<typeof patchResourceCreateSchema>

interface Props {
  section: string
  control: ControlType
  errors: ErrorType
}

export const ResourceTypeSelect = ({ section, control, errors }: Props) => {
  const options =
    section === 'direct' ? DIRECT_STORAGE_TYPES : NETDISK_STORAGE_TYPES

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">资源来源</h3>
      <p className="text-sm text-default-500">
        选择具体的网盘平台或直链类型，方便前台区分展示。
      </p>

      <Controller
        name="storage"
        control={control}
        render={({ field }) => (
          <Select
            label="请选择资源来源"
            selectedKeys={field.value ? [field.value] : []}
            onSelectionChange={(key) => {
              field.onChange(Array.from(key).join(''))
            }}
            isInvalid={!!errors.storage}
            errorMessage={errors.storage?.message}
          >
            {options.map((type) => (
              <SelectItem key={type.value} textValue={type.label}>
                <div className="flex flex-col">
                  <span>{type.label}</span>
                  <span className="text-small text-default-500">
                    {type.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </Select>
        )}
      />
    </div>
  )
}
