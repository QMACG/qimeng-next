'use client'

import { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import DOMPurify from 'isomorphic-dompurify'
import { Card, CardBody } from '@heroui/card'
import { Info } from './Info'
import { PatchTag } from './Tag'
import dynamic from 'next/dynamic'
import { useMounted } from '~/hooks/useMounted'
import { GalgameCard as GalgameCardView } from '~/components/galgame/Card'
import { KunLink } from '~/components/kun/milkdown/plugins/components/link/KunLink'
import { KunExternalLink } from '~/components/kun/external-link/ExternalLink'
import { MarkdownButtonLink } from '~/components/kun/markdown/MarkdownButtonLink'
import type { PatchIntroduction } from '~/types/api/patch'

import './_adjust.scss'
import { PatchCompany } from './Company'

const KunPlyr = dynamic(
  () =>
    import('~/components/kun/milkdown/plugins/components/video/Plyr').then(
      (mod) => mod.KunPlyr
    ),
  { ssr: false }
)

interface Props {
  intro: PatchIntroduction
  patchId: number
  relatedPatches: GalgameCard[]
  showRelatedGames: boolean
  uid?: number
}

export const IntroductionTab = ({
  intro,
  patchId,
  relatedPatches,
  showRelatedGames
}: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const isMounted = useMounted()

  useEffect(() => {
    if (!contentRef.current || !isMounted) {
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
      const videoRoot = createRoot(root)
      videoRoot.render(<KunExternalLink link={href}>{text}</KunExternalLink>)
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
      const videoRoot = createRoot(root)
      videoRoot.render(<KunPlyr src={src} />)
    })

    const linkElements = contentRef.current.querySelectorAll('[data-kun-link]')
    linkElements.forEach((element) => {
      const href = element.getAttribute('data-href')
      const text = element.getAttribute('data-text')
      if (!href || !text) return

      const root = document.createElement('div')
      root.className = element.className
      element.replaceWith(root)

      const linkRoot = ReactDOM.createRoot(root)
      linkRoot.render(<KunLink href={href} text={text} />)
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
        <MarkdownButtonLink href={href} type={type}>
          {text}
        </MarkdownButtonLink>
      )
    })
  }, [isMounted])

  return (
    <Card className="p-1 sm:p-8">
      <CardBody className="space-y-6 p-4">
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(intro.introduction)
          }}
          className="kun-prose max-w-none"
        />

        <PatchTag patchId={patchId} initialTags={intro.tag} />

        <PatchCompany initialCompanies={intro.company} />

        <Info intro={intro} />

        {showRelatedGames && relatedPatches.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">相关推荐</h2>
              <p className="text-sm text-default-500">
                根据当前作品的标签和会社，随机推荐 8 部你可能也会感兴趣的游戏。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {relatedPatches.map((patch) => (
                <GalgameCardView key={patch.id} patch={patch} />
              ))}
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}
