import { Tab, Tabs } from '@heroui/tabs'
import { IntroductionTab } from '~/components/patch/introduction/IntroductionTab'
import { ResourceTab } from '~/components/patch/resource/ResourceTab'
import { CommentTab } from '~/components/patch/comment/CommentTab'
import { RatingTab } from '~/components/patch/rating/RatingTab'
import type { PatchIntroduction } from '~/types/api/patch'
import type { Dispatch, SetStateAction } from 'react'

interface PatchHeaderProps {
  id: number
  uid?: number
  intro: PatchIntroduction
  relatedPatches: GalgameCard[]
  showRelatedGames: boolean
  selected: string
  setSelected: Dispatch<SetStateAction<string>>
}

export const PatchHeaderTabs = ({
  id,
  uid,
  intro,
  relatedPatches,
  showRelatedGames,
  selected,
  setSelected
}: PatchHeaderProps) => {
  return (
    <Tabs
      className="my-6 w-full overflow-hidden rounded-large shadow-medium"
      fullWidth
      defaultSelectedKey="introduction"
      onSelectionChange={(value) => {
        setSelected(value.toString())
      }}
      selectedKey={selected}
    >
      <Tab key="introduction" title="游戏信息" className="min-w-20 p-0">
        <IntroductionTab
          intro={intro}
          patchId={Number(id)}
          relatedPatches={relatedPatches}
          showRelatedGames={showRelatedGames}
          uid={uid}
        />
      </Tab>

      <Tab key="resources" title="资源链接" className="min-w-20 p-0">
        <ResourceTab id={id} />
      </Tab>

      <Tab key="comments" title="评论" className="min-w-20 p-0">
        <CommentTab id={id} />
      </Tab>

      <Tab key="rating" title="评分" className="min-w-20 p-0">
        <RatingTab id={id} />
      </Tab>
    </Tabs>
  )
}
