'use client'

import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button, Card, CardBody, Chip, Snippet } from '@heroui/react'
import { Download, LockKeyhole, ShieldCheck } from 'lucide-react'
import { KunCaptchaModal } from '~/components/kun/auth/CaptchaModal'
import { kunFetchPost } from '~/utils/kunFetch'
import type {
  DirectDownloadPrepareResponse,
  DirectDownloadPreview
} from '~/types/api/direct-download'

interface Props {
  preview: DirectDownloadPreview
}

const navigateWithoutReferrer = (url: string) => {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.rel = 'noreferrer noopener'
  anchor.referrerPolicy = 'no-referrer'
  anchor.target = '_self'
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export const GetFileContainer = ({ preview }: Props) => {
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const requestDownload = async (captcha = '') => {
    setSubmitting(true)

    try {
      const response = await kunFetchPost<
        KunResponse<DirectDownloadPrepareResponse>
      >('/direct-download', {
        file: preview.file,
        captcha
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      navigateWithoutReferrer(response.downloadUrl)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '生成下载链接失败')
    } finally {
      setSubmitting(false)
      setIsCaptchaOpen(false)
    }
  }

  const handleDownload = async () => {
    if (!preview.canDownload) {
      return
    }

    if (preview.requiresCaptcha) {
      setIsCaptchaOpen(true)
      return
    }

    await requestDownload()
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Card className="overflow-hidden border border-default-200/70 shadow-sm">
            <div className="bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-background px-6 py-6">
              <div className="flex flex-wrap items-center gap-3">
                <Chip color="primary" variant="flat">
                  直链下载
                </Chip>
                {preview.requiresCaptcha ? (
                  <Chip
                    color="secondary"
                    variant="flat"
                    startContent={<ShieldCheck className="size-4" />}
                  >
                    已启用验证码
                  </Chip>
                ) : null}
                {!preview.isLoggedIn ? (
                  <Chip
                    color="warning"
                    variant="flat"
                    startContent={<LockKeyhole className="size-4" />}
                  >
                    需要登录
                  </Chip>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                <h1 className="text-2xl font-bold">
                  {preview.resource?.name || '直链资源'}
                </h1>
                <p className="text-sm leading-7 text-default-600">
                  {preview.message}
                </p>
              </div>
            </div>

            <CardBody className="space-y-5 px-6 py-6">
              {preview.patch ? (
                <div className="space-y-1">
                  <p className="text-sm text-default-500">所属游戏</p>
                  <Link
                    href={`/${preview.patch.uniqueId}`}
                    className="text-base font-medium text-primary hover:underline"
                  >
                    {preview.patch.name}
                  </Link>
                </div>
              ) : null}

              {preview.file ? (
                <div className="space-y-2">
                  <p className="text-sm text-default-500">文件路径</p>
                  <Snippet
                    symbol=""
                    size="lg"
                    disableCopy={false}
                    className="w-full overflow-auto"
                  >
                    {preview.file}
                  </Snippet>
                </div>
              ) : null}

              {preview.rateLimitWindowMinutes > 0 &&
              preview.rateLimitMaxCount > 0 ? (
                <div className="rounded-2xl bg-default-100 px-4 py-3 text-sm text-default-600">
                  当前限制：{preview.rateLimitWindowMinutes} 分钟内，同一直链文件最多下载{' '}
                  {preview.rateLimitMaxCount} 次。
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                {preview.canDownload ? (
                  <Button
                    color="primary"
                    size="lg"
                    startContent={<Download className="size-4" />}
                    onPress={() => void handleDownload()}
                    isLoading={submitting}
                    isDisabled={submitting}
                  >
                    开始下载
                  </Button>
                ) : preview.isLoggedIn ? null : (
                  <Button as={Link} href="/login" color="primary" size="lg">
                    前往登录
                  </Button>
                )}

                {preview.patch ? (
                  <Button
                    as={Link}
                    href={`/${preview.patch.uniqueId}`}
                    variant="flat"
                    size="lg"
                  >
                    返回游戏页
                  </Button>
                ) : (
                  <Button as={Link} href="/" variant="flat" size="lg">
                    返回首页
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <KunCaptchaModal
        isOpen={isCaptchaOpen}
        onClose={() => {
          if (!submitting) {
            setIsCaptchaOpen(false)
          }
        }}
        onSuccess={(code) => {
          void requestDownload(code)
        }}
      />
    </>
  )
}
