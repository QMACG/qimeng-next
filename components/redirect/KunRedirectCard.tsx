'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, Card, CardBody, CardFooter, Snippet } from '@heroui/react'
import { ExternalLink, ShieldAlert } from 'lucide-react'
import { kunMoyuMoe } from '~/config/moyu-moe'

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

const parseTargetUrl = (value: string | null) => {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

export const KunRedirectCard = () => {
  const searchParams = useSearchParams()
  const rawUrl = searchParams.get('url')
  const url = useMemo(() => parseTargetUrl(rawUrl), [rawUrl])

  const handleRedirect = useCallback(() => {
    if (!url) {
      return
    }

    navigateWithoutReferrer(url)
  }, [url])

  return (
    <Card className="w-full max-w-2xl">
      <CardBody className="gap-4">
        <div className="flex items-center gap-2 text-warning-500">
          <ShieldAlert className="h-5 w-5" />
          <p className="text-lg">你即将离开 {kunMoyuMoe.titleShort}</p>
        </div>

        <p className="text-default-500">
          请确认目标链接可信后，再点击下方按钮继续访问。
        </p>

        <div className="overflow-auto">
          <Snippet
            disableCopy
            symbol=""
            size="lg"
            className="w-full overflow-auto scrollbar-hide"
            color="primary"
            copyIcon={<ExternalLink />}
          >
            {url || '无效的目标链接'}
          </Snippet>
        </div>
      </CardBody>

      <CardFooter className="justify-center">
        <Button
          size="lg"
          color="primary"
          variant="shadow"
          onPress={handleRedirect}
          isDisabled={!url}
        >
          确认继续访问
        </Button>
      </CardFooter>
    </Card>
  )
}
