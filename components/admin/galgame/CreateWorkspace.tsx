'use client'

import { useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem
} from '@heroui/react'
import { useCreatePatchStore } from '~/store/editStore'
import { BannerImage } from '~/components/edit/create/BannerImage'
import { DuplicateCheckButton } from '~/components/edit/create/DuplicateCheckButton'
import { PatchIntroduction } from '~/components/edit/create/PatchIntroduction'
import { BatchTag } from '~/components/edit/components/BatchTag'
import { CompanySummary } from '~/components/edit/components/CompanySummary'
import { CompanySelector } from '~/components/edit/components/CompanySelector'
import { ContentLimit } from '~/components/edit/create/ContentLimit'
import { ResourceDraftPanel } from './ResourceDraftPanel'
import { AdminPublishButton } from './AdminPublishButton'
import { ResourceNoteEditor } from './ResourceNoteEditor'
import { CONTENT_VISIBILITY_OPTIONS } from '~/constants/contentVisibility'
import type { CreatePatchRequestData } from '~/store/editStore'
import { toDatetimeLocalValue, toIsoString } from './datetime'

const LABEL_NEW_GAME = '新建游戏'
const LABEL_GAME_NAME = '游戏名称'
const LABEL_GAME_NAME_PLACEHOLDER = '输入游戏名称'
const LABEL_PUBLISH_STATUS = '发布设置'
const LABEL_VISIBILITY = '可见状态'
const LABEL_PUBLISHED_AT = '发布时间'

export const CreateWorkspace = () => {
  const { data, setData } = useCreatePatchStore()
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePatchRequestData, string>>
  >({})

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 py-4">
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="shrink-0 text-2xl">{LABEL_NEW_GAME}</h1>
              <DuplicateCheckButton />
            </div>
          </div>
        </CardHeader>
        <CardBody className="mt-4 space-y-12">
          <div className="space-y-2">
            <h2 className="text-xl">{LABEL_GAME_NAME}</h2>
            <Input
              isRequired
              variant="underlined"
              labelPlacement="outside"
              placeholder={LABEL_GAME_NAME_PLACEHOLDER}
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl">{LABEL_PUBLISH_STATUS}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={LABEL_VISIBILITY}
                labelPlacement="outside"
                selectedKeys={new Set([String(data.status)])}
                onChange={(event) =>
                  setData({ ...data, status: Number(event.target.value) })
                }
              >
                {CONTENT_VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              <Input
                type="datetime-local"
                label={LABEL_PUBLISHED_AT}
                labelPlacement="outside"
                value={toDatetimeLocalValue(data.publishedAt)}
                onChange={(event) =>
                  setData({
                    ...data,
                    publishedAt: toIsoString(event.target.value)
                  })
                }
                isInvalid={!!errors.publishedAt}
                errorMessage={errors.publishedAt}
              />
            </div>
          </div>

          <BannerImage errors={errors.banner} />
          <PatchIntroduction errors={errors.introduction} />

          <CompanySelector
            companies={data.companies}
            onChange={(companies) => setData({ ...data, companies })}
          />
          <CompanySummary data={data} />

          <BatchTag
            data={data}
            saveTag={(tag) =>
              setData({
                ...data,
                tag
              })
            }
            errors={errors.tag}
          />

          <ContentLimit errors={errors.contentLimit} />
          <ResourceDraftPanel />
          <ResourceNoteEditor
            value={data.resourceNote}
            onChange={(resourceNote) => setData({ ...data, resourceNote })}
          />
          <AdminPublishButton setErrors={setErrors} />
        </CardBody>
      </Card>
    </div>
  )
}
