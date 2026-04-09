'use client'

import { useEffect, useRef, useState } from 'react'
import { useRewritePatchStore } from '~/store/rewriteStore'
import { PatchHeaderTabs } from './Tabs'
import { PatchHeaderInfo } from './Info'
import { KunAutoImageViewer } from '~/components/kun/image-viewer/AutoImageViewer'
import { NsfwBlockedNotice } from './NsfwBlockedNotice'
import type { Patch, PatchIntroduction } from '~/types/api/patch'

interface PatchHeaderProps {
  patch: Patch
  intro: PatchIntroduction
  uid?: number
}

export const PatchHeaderContainer = ({
  patch,
  intro,
  uid
}: PatchHeaderProps) => {
  const { setData } = useRewritePatchStore()
  const [selected, setSelected] = useState('introduction')
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setData({
      id: patch.id,
      uniqueId: patch.uniqueId,
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
      {patch.contentLimit === 'nsfw' && !uid ? (
        <NsfwBlockedNotice isLoggedIn={false} />
      ) : (
        <>
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
              uid={uid}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
        </>
      )}
    </div>
  )
}
