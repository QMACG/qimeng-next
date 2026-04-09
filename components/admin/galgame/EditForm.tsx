'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem
} from '@heroui/react'
import toast from 'react-hot-toast'
import { KunDualEditorProvider } from '~/components/kun/milkdown/DualEditorProvider'
import { useRewritePatchStore } from '~/store/rewriteStore'
import { kunFetchPut } from '~/utils/kunFetch'
import { errorReporter } from '~/utils/kunErrorHandler'
import { patchUpdateSchema } from '~/validations/edit'
import { GameNameInput } from '~/components/edit/rewrite/GameNameInput'
import { ContentLimit } from '~/components/edit/rewrite/ContentLimit'
import { BatchTag } from '~/components/edit/components/BatchTag'
import { CompanySummary } from '~/components/edit/components/CompanySummary'
import { CompanySelector } from '~/components/edit/components/CompanySelector'
import { ResourceNoteEditor } from './ResourceNoteEditor'
import { CONTENT_VISIBILITY_OPTIONS } from '~/constants/contentVisibility'
import type { RewritePatchData } from '~/store/rewriteStore'

const LABEL_EDIT_GAME = '编辑游戏'
const LABEL_PUBLISH_STATUS = '发布状态'
const LABEL_VISIBILITY = '可见性'
const LABEL_BANNER = '封面图片链接'
const LABEL_BANNER_URL = '封面 URL'
const LABEL_BANNER_PLACEHOLDER = '填写游戏封面的图片直链'
const LABEL_INTRO = '游戏介绍'
const LABEL_SAVE = '保存修改'
const LABEL_UPDATED = '游戏已更新'

export const EditForm = () => {
  const { data, setData } = useRewritePatchStore()
  const [errors, setErrors] = useState<
    Partial<Record<keyof RewritePatchData, string>>
  >({})
  const [rewriting, setRewriting] = useState(false)

  const handleSubmit = async () => {
    const result = patchUpdateSchema.safeParse({
      ...data,
      companyIds: data.companies.map((company) => company.id)
    })

    if (!result.success) {
      const newErrors: Partial<Record<keyof RewritePatchData, string>> = {}
      result.error.errors.forEach((err) => {
        if (err.path.length) {
          newErrors[err.path[0] as keyof RewritePatchData] = err.message
          toast.error(err.message)
        }
      })
      setErrors(newErrors)
      return
    }

    setErrors({})
    setRewriting(true)

    try {
      const response = await kunFetchPut<KunResponse<{}>>('/edit', {
        ...data,
        companyIds: data.companies.map((company) => company.id)
      })
      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success(LABEL_UPDATED)
      window.location.assign(`/admin/galgame/${data.uniqueId}`)
    } catch (error) {
      errorReporter(error)
    } finally {
      setRewriting(false)
    }
  }

  return (
    <form className="w-full">
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-2xl">{LABEL_EDIT_GAME}</p>
          </div>
        </CardHeader>
        <CardBody className="mt-4 space-y-12">
          <div className="space-y-2">
            <h2 className="text-xl">游戏 ID</h2>
            <Input
              isReadOnly
              label="当前游戏 ID"
              labelPlacement="outside"
              value={String(data.id)}
            />
          </div>

          <GameNameInput
            name={data.name}
            onChange={(name) => setData({ ...data, name })}
            error={errors.name}
          />

          <div className="space-y-2">
            <h2 className="text-xl">{LABEL_PUBLISH_STATUS}</h2>
            <Select
              label={LABEL_VISIBILITY}
              labelPlacement="outside"
              selectedKeys={new Set([String(data.status)])}
              onChange={(event) =>
                setData({ ...data, status: Number(event.target.value) })
              }
            >
              {CONTENT_VISIBILITY_OPTIONS.map((option) => (
                <SelectItem key={String(option.value)}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl">{LABEL_BANNER}</h2>
            <Input
              isRequired
              label={LABEL_BANNER_URL}
              labelPlacement="outside"
              placeholder={LABEL_BANNER_PLACEHOLDER}
              value={data.banner}
              onChange={(event) =>
                setData({ ...data, banner: event.target.value })
              }
              isInvalid={!!errors.banner}
              errorMessage={errors.banner}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl">{LABEL_INTRO}</h2>
            {errors.introduction ? (
              <p className="text-xs text-danger-500">{errors.introduction}</p>
            ) : null}
            <KunDualEditorProvider storeName="patchRewrite" />
          </div>

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
          <ResourceNoteEditor
            value={data.resourceNote}
            onChange={(resourceNote) => setData({ ...data, resourceNote })}
          />

          <Button
            color="primary"
            className="mt-4 w-full"
            onPress={handleSubmit}
            isLoading={rewriting}
            isDisabled={rewriting}
          >
            {LABEL_SAVE}
          </Button>
        </CardBody>
      </Card>
    </form>
  )
}
