'use client'

import { useRouter } from '@bprogress/next'
import { Button, Tooltip } from '@heroui/react'
import toast from 'react-hot-toast'
import { MessageCircleQuestion } from 'lucide-react'
import {
  buildPatchFeedbackPrefill,
  FEEDBACK_COMMENTS_HASH,
  FEEDBACK_DOC_PATH
} from '~/constants/feedback'
import { useUserStore } from '~/store/userStore'
import type { Patch } from '~/types/api/patch'

interface Props {
  patch: Patch
}

export const FeedbackButton = ({ patch }: Props) => {
  const router = useRouter()
  const user = useUserStore((state) => state.user)

  const handleOpenFeedback = () => {
    if (!user.uid) {
      toast.error('请先登录后再提交反馈')
      return
    }

    const prefill = encodeURIComponent(buildPatchFeedbackPrefill(patch.name))
    router.push(
      `${FEEDBACK_DOC_PATH}?prefill=${prefill}#${FEEDBACK_COMMENTS_HASH}`
    )
  }

  return (
    <Tooltip content="游戏反馈">
      <Button
        variant="bordered"
        isIconOnly
        aria-label="游戏反馈"
        onPress={handleOpenFeedback}
        size="sm"
      >
        <MessageCircleQuestion className="size-4" />
      </Button>
    </Tooltip>
  )
}
