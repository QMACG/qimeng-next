'use client'

import { Radio, RadioGroup } from '@heroui/react'
import {
  RESOURCE_SECTION_MAP,
  SUPPORTED_RESOURCE_SECTION
} from '~/constants/resource'
import type { ErrorType } from '../share'

interface Props {
  errors: ErrorType
  section: string
  setSection: (value: string) => void
}

export const ResourceSectionSelect = ({
  errors,
  section,
  setSection
}: Props) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">资源分区</h3>
      <RadioGroup
        value={section}
        onValueChange={setSection}
        isInvalid={!!errors.section}
        errorMessage={errors.section?.message}
      >
        {SUPPORTED_RESOURCE_SECTION.map((item) => (
          <Radio key={item} value={item}>
            {RESOURCE_SECTION_MAP[item]}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  )
}
