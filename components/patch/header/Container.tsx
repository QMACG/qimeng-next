'use client'

import { useEffect, useRef, useState } from 'react'
import { useRewritePatchStore } from '~/store/rewriteStore'
import { PatchHeaderTabs } from './Tabs'
import { PatchHeaderInfo } from './Info'
import { KunAutoImageViewer } from '~/components/kun/image-viewer/AutoImageViewer'
import type { Patch, PatchIntroduction } from '~/types/api/patch'

interface PatchHeaderProps {
  patch: Patch
  intro: PatchIntroduction
  relatedPatches: GalgameCard[]
  showRelatedGames: boolean
  uid?: number
}

export const PatchHeaderContainer = ({
  patch,
  intro,
  relatedPatches,
  showRelatedGames,
  uid
}: PatchHeaderProps) => {
  const { setData } = useRewritePatchStore()
  const [selected, setSelected] = useState('introduction')
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setData({
      id: patch.id,
      uniqueId: patch.uniqueId,
      publishedAt: String(patch.created),
      status: patch.status,
      banner: patch.banner,
      name: patch.name,
      introduction: patch.introduction,
      tag: patch.tags,
      companies: intro.company,
      resourceNote: intro.resourceNote,
      contentLimit: patch.contentLimit,
      released: intro.released
    })
  }, [intro.released, patch, setData])

  return (
    <div className="relative mx-auto w-full max-w-7xl">
      <KunAutoImageViewer />

      <PatchHeaderInfo
        patch={patch}
        handleClickDownloadNav={() => {
          setSelected('resources')
          tabsRef.current?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      <div ref={tabsRef}>
        <PatchHeaderTabs
          id={patch.id}
          intro={intro}
          relatedPatches={relatedPatches}
          showRelatedGames={showRelatedGames}
          uid={uid}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </div>
  )
}
