'use client'

import { Card, CardBody, CardHeader } from '@heroui/react'
import DOMPurify from 'isomorphic-dompurify'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { markdownToHtmlExtend } from '~/app/api/utils/render/markdownToHtmlExtend'
import { KunLoading } from '~/components/kun/Loading'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { KunLink } from '~/components/kun/milkdown/plugins/components/link/KunLink'
import { useMounted } from '~/hooks/useMounted'
import { MarkdownButtonLink } from './MarkdownButtonLink'

import '~/components/patch/introduction/_adjust.scss'

const KunPlyr = dynamic(
  () =>
    import('~/components/kun/milkdown/plugins/components/video/Plyr').then(
      (mod) => mod.KunPlyr
    ),
  { ssr: false }
)

interface Props {
  markdown: string
  title?: string
  emptyHint?: string
  embedded?: boolean
  openLinksInNewTab?: boolean
}

export const PublishedMarkdownPreview = ({
  markdown,
  title = '发布预览',
  emptyHint = '输入内容后，这里会尽量贴近正式发布页面的展示效果。',
  embedded = false,
  openLinksInNewTab = false
}: Props) => {
  const isMounted = useMounted()
  const contentRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const renderMarkdown = async () => {
      if (!markdown.trim()) {
        setHtml('')
        return
      }

      setLoading(true)
      try {
        const renderedHtml = await markdownToHtmlExtend(markdown)
        if (!cancelled) {
          setHtml(DOMPurify.sanitize(renderedHtml))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void renderMarkdown()

    return () => {
      cancelled = true
    }
  }, [markdown])

  useEffect(() => {
    if (!contentRef.current || !isMounted || !html) {
      return
    }

    const externalLinkElements = contentRef.current.querySelectorAll(
      '[data-kun-external-link]'
    )
    externalLinkElements.forEach((element) => {
      const text = element.getAttribute('data-text')
      const href = element.getAttribute('data-href')
      if (!text || !href) {
        return
      }

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)
      const linkRoot = ReactDOM.createRoot(root)
      linkRoot.render(
        <KunExternalLink
          link={href}
          target={openLinksInNewTab ? '_blank' : undefined}
          rel={openLinksInNewTab ? 'noopener noreferrer' : undefined}
        >
          {text}
        </KunExternalLink>
      )
    })

    const videoElements = contentRef.current.querySelectorAll(
      '[data-video-player]'
    )
    videoElements.forEach((element) => {
      const src = element.getAttribute('data-src')
      if (!src) {
        return
      }

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)
      const videoRoot = ReactDOM.createRoot(root)
      videoRoot.render(<KunPlyr src={src} />)
    })

    const linkElements = contentRef.current.querySelectorAll('[data-kun-link]')
    linkElements.forEach((element) => {
      const href = element.getAttribute('data-href')
      const text = element.getAttribute('data-text')
      if (!href || !text) {
        return
      }

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)
      const linkRoot = ReactDOM.createRoot(root)
      linkRoot.render(
        <KunLink href={href} text={text} targetBlank={openLinksInNewTab} />
      )
    })

    const buttonElements =
      contentRef.current.querySelectorAll('[data-kun-button]')
    buttonElements.forEach((element) => {
      const href = element.getAttribute('data-href')
      const text = element.getAttribute('data-text')
      const type = element.getAttribute('data-type') ?? 'primary'
      if (!href || !text) {
        return
      }

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)
      const buttonRoot = ReactDOM.createRoot(root)
      buttonRoot.render(
        <MarkdownButtonLink
          href={href}
          type={type}
          targetBlank={openLinksInNewTab}
        >
          {text}
        </MarkdownButtonLink>
      )
    })

    if (openLinksInNewTab) {
      const anchorElements = contentRef.current.querySelectorAll('a[href]')
      anchorElements.forEach((element) => {
        element.setAttribute('target', '_blank')
        element.setAttribute('rel', 'noopener noreferrer')
      })
    }
  }, [html, isMounted, openLinksInNewTab])

  const content = loading ? (
    <KunLoading className="min-h-32" hint="正在生成预览..." />
  ) : html ? (
    <div
      ref={contentRef}
      className="kun-prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <div className="rounded-large border border-dashed border-default-300 p-6 text-sm text-default-500">
      {emptyHint}
    </div>
  )

  if (embedded) {
    return <div className="space-y-6">{content}</div>
  }

  const hasTitle = title.trim().length > 0

  return (
    <Card className="border border-default-200">
      {hasTitle ? (
        <CardHeader className="flex-col items-start gap-2">
          <h3 className="text-lg font-medium">{title}</h3>
        </CardHeader>
      ) : null}
      <CardBody className={`space-y-6 ${hasTitle ? 'p-4' : 'p-4 pt-5'}`}>
        {content}
      </CardBody>
    </Card>
  )
}
