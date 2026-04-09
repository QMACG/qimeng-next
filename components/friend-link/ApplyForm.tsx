'use client'

import { useState } from 'react'
import { useRouter } from '@bprogress/next'
import { Button, Card, CardBody, Input, Textarea } from '@heroui/react'
import toast from 'react-hot-toast'
import { kunFetchPost } from '~/utils/kunFetch'
import type { FriendLinkItem } from '~/types/api/friend-link'

interface Props {
  isLoggedIn: boolean
}

interface FriendLinkApplyFormState {
  name: string
  avatar: string
  description: string
  link: string
}

const EMPTY_FORM: FriendLinkApplyFormState = {
  name: '',
  avatar: '',
  description: '',
  link: ''
}

export const FriendLinkApplyForm = ({ isLoggedIn }: Props) => {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录后再提交友链申请')
      router.push('/login')
      return
    }

    setSubmitting(true)

    try {
      const response = await kunFetchPost<KunResponse<FriendLinkItem>>(
        '/friend-link/apply',
        {
          name: form.name,
          avatar: form.avatar,
          description: form.description,
          link: form.link
        }
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success('友链申请已提交，请等待审核')
      setForm(EMPTY_FORM)
      router.push('/friend-link')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border border-default-200">
      <CardBody className="space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">申请友情链接</h1>
          <p className="text-default-500">
            登录后可提交站点信息，提交后会进入后台待审核列表。
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-sm leading-7 text-warning-800">
            当前未登录，请先登录后再提交友链申请。
          </div>
        ) : null}

        <Input
          label="站点名称"
          labelPlacement="outside"
          placeholder="请输入站点名称"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
        />

        <Input
          label="网站网址"
          labelPlacement="outside"
          placeholder="https://example.com"
          value={form.link}
          onChange={(event) =>
            setForm((current) => ({ ...current, link: event.target.value }))
          }
        />

        <Input
          label="网站图标"
          labelPlacement="outside"
          placeholder="可留空，留空时会优先尝试读取对方网站 favicon.ico"
          value={form.avatar}
          onChange={(event) =>
            setForm((current) => ({ ...current, avatar: event.target.value }))
          }
        />

        <Textarea
          label="网站简介"
          labelPlacement="outside"
          placeholder="请输入站点简介"
          minRows={4}
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value
            }))
          }
        />

        <div className="flex flex-wrap gap-3">
          <Button
            color="primary"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
            isDisabled={submitting}
          >
            提交申请
          </Button>
          <Button variant="light" onPress={() => router.push('/friend-link')}>
            返回友情链接
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
