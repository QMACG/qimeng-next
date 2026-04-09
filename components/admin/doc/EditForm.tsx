'use client'

import { useMemo, useState } from 'react'
import { useRouter } from '@bprogress/next'
import toast from 'react-hot-toast'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea
} from '@heroui/react'
import { kunFetchDelete, kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
import { errorReporter } from '~/utils/kunErrorHandler'
import { MarkdownEditor } from '~/components/kun/markdown/MarkdownEditor'
import { CONTENT_VISIBILITY_OPTIONS } from '~/constants/contentVisibility'
import type { AdminDocPost } from '~/types/api/admin'

interface Props {
  mode: 'create' | 'edit'
  initialPost?: AdminDocPost
}

interface DocFormState {
  title: string
  directoryLabel: string
  directoryPath: string
  slug: string
  banner: string
  description: string
  content: string
  status: 0 | 1 | 2 | 3
  pin: boolean
  sortOrder: number
  publishedAt: string
}

const normalizePath = (value: string) =>
  value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\/{2,}/g, '/')

const normalizeUrlPath = (value: string) => normalizePath(value).toLowerCase()

const toDatetimeLocalValue = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

const toIsoString = (value: string) => {
  if (!value) {
    return new Date().toISOString()
  }

  return new Date(value).toISOString()
}

const getDirectoryPathFromSlug = (slug: string, category?: string) => {
  const normalized = normalizeUrlPath(slug)
  const segments = normalized.split('/').filter(Boolean)
  const directory = segments.slice(0, -1).join('/')

  return directory || category || 'article'
}

const getLeafSlug = (slug: string) => {
  const normalized = normalizeUrlPath(slug)
  const segments = normalized.split('/').filter(Boolean)

  return segments.at(-1) ?? 'common'
}

const buildDocSlug = (directoryPath: string, slug: string) =>
  [normalizeUrlPath(directoryPath), normalizeUrlPath(slug)]
    .filter(Boolean)
    .join('/')

const getInitialState = (post?: AdminDocPost): DocFormState => ({
  title: post?.title ?? '',
  directoryLabel: post?.directoryLabel ?? '文章',
  directoryPath: getDirectoryPathFromSlug(
    post?.slug ?? 'article/common',
    post?.category
  ),
  slug: getLeafSlug(post?.slug ?? 'article/common'),
  banner: post?.banner ?? '/favicon.ico',
  description: post?.description ?? '',
  content: post?.content ?? '',
  status: (post?.status as 0 | 1 | 2 | 3) ?? 1,
  pin: post?.pin ?? false,
  sortOrder: post?.sortOrder ?? 0,
  publishedAt: toDatetimeLocalValue(post?.publishedAt ?? new Date().toISOString())
})

const getDocPath = (slug: string) => `/doc/${slug.replace(/^\/+/, '')}`

export const DocEditForm = ({ mode, initialPost }: Props) => {
  const router = useRouter()
  const [form, setForm] = useState<DocFormState>(getInitialState(initialPost))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const normalizedDirectoryPath = useMemo(
    () => normalizeUrlPath(form.directoryPath),
    [form.directoryPath]
  )

  const normalizedSlug = useMemo(() => normalizeUrlPath(form.slug), [form.slug])

  const publicPath = useMemo(
    () => getDocPath(buildDocSlug(normalizedDirectoryPath, normalizedSlug)),
    [normalizedDirectoryPath, normalizedSlug]
  )

  const handleChange = <K extends keyof DocFormState>(
    key: K,
    value: DocFormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)

    const fullSlug = buildDocSlug(normalizedDirectoryPath, normalizedSlug)
    const payload = {
      title: form.title,
      directoryLabel: form.directoryLabel.trim(),
      slug: fullSlug,
      banner: form.banner,
      description: form.description,
      content: form.content,
      category: normalizedDirectoryPath.split('/')[0] || 'article',
      status: form.status,
      pin: form.pin,
      sortOrder: form.sortOrder,
      publishedAt: toIsoString(form.publishedAt)
    }

    try {
      const response =
        mode === 'create'
          ? await kunFetchPost<KunResponse<AdminDocPost>>('/admin/doc', payload)
          : await kunFetchPut<KunResponse<AdminDocPost>>('/admin/doc', {
              id: initialPost!.id,
              ...payload
            })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success(mode === 'create' ? '文章创建成功' : '文章保存成功')
      router.push(`/admin/doc/${response.id}`)
    } catch (error) {
      errorReporter(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialPost) {
      return
    }

    setDeleting(true)

    try {
      const response = await kunFetchDelete<KunResponse<{}>>('/admin/doc', {
        id: initialPost.id
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success('文章已删除')
      router.push('/admin/doc')
    } catch (error) {
      errorReporter(error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-2">
        <h2 className="text-xl font-semibold">文章内容</h2>
      </CardHeader>

      <CardBody className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="标题"
            labelPlacement="outside"
            placeholder="输入文章标题"
            value={form.title}
            onChange={(event) => handleChange('title', event.target.value)}
          />

          <Input
            label="封面链接"
            labelPlacement="outside"
            placeholder="https://example.com/banner.jpg"
            value={form.banner}
            onChange={(event) => handleChange('banner', event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="目录名称"
            labelPlacement="outside"
            placeholder="例如：文章、帮助、活动"
            description="用于前台显示，可填写中文。"
            value={form.directoryLabel}
            onChange={(event) =>
              handleChange('directoryLabel', event.target.value)
            }
          />

          <Input
            label="目录路径"
            labelPlacement="outside"
            placeholder="例如：article 或 help/account"
            description="用于访问路径，将自动转换为小写英文。"
            value={form.directoryPath}
            onChange={(event) =>
              handleChange('directoryPath', event.target.value)
            }
          />
        </div>

        <Input
          label="文章路径"
          labelPlacement="outside"
          placeholder="getting-started"
          description={`前台访问地址：${publicPath}`}
          value={form.slug}
          onChange={(event) => handleChange('slug', event.target.value)}
        />

        <Textarea
          label="摘要"
          labelPlacement="outside"
          placeholder="用于列表展示和 SEO 摘要"
          minRows={3}
          value={form.description}
          onChange={(event) => handleChange('description', event.target.value)}
        />

        <MarkdownEditor
          value={form.content}
          onChange={(content) => handleChange('content', content)}
          editorTitle="正文 Markdown"
          previewTitle="文章预览"
          placeholder="输入正文内容"
          minRows={22}
          layout="tabs"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="发布状态"
            labelPlacement="outside"
            selectedKeys={new Set([String(form.status)])}
            onChange={(event) =>
              handleChange('status', Number(event.target.value) as 0 | 1 | 2 | 3)
            }
          >
            {CONTENT_VISIBILITY_OPTIONS.map((option) => (
              <SelectItem key={String(option.value)}>{option.label}</SelectItem>
            ))}
          </Select>

          <Input
            type="number"
            label="排序值"
            labelPlacement="outside"
            value={String(form.sortOrder)}
            onChange={(event) =>
              handleChange('sortOrder', Number(event.target.value) || 0)
            }
          />

          <Input
            type="datetime-local"
            label="发布时间"
            labelPlacement="outside"
            value={form.publishedAt}
            onChange={(event) => handleChange('publishedAt', event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 rounded-large border border-divider p-4">
          <Switch
            isSelected={form.pin}
            onValueChange={(value) => handleChange('pin', value)}
          >
            首页轮播
          </Switch>

          <div className="text-sm text-default-500">
            {initialPost
              ? `创建于 ${new Date(initialPost.created).toLocaleString('zh-CN')}，最后更新于 ${new Date(initialPost.updated).toLocaleString('zh-CN')}`
              : '创建后可立即查看'}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {initialPost ? (
              <Button
                color="danger"
                variant="flat"
                onPress={handleDelete}
                isLoading={deleting}
                isDisabled={saving || deleting}
              >
                删除文章
              </Button>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button variant="flat" onPress={() => router.push('/admin/doc')}>
              返回列表
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={saving}
              isDisabled={saving || deleting}
            >
              {mode === 'create' ? '创建文章' : '保存修改'}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
