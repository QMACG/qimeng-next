import { Calendar, Clock, RefreshCw } from 'lucide-react'
import { formatDate } from '~/utils/time'
import type { PatchIntroduction } from '~/types/api/patch'

interface Props {
  intro: PatchIntroduction
}

export const Info = ({ intro }: Props) => {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-2 text-sm text-default-500">
        <Clock className="size-4" />
        <span>发布时间: {formatDate(intro.created, { isShowYear: true })}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-default-500">
        <RefreshCw className="size-4" />
        <span>
          资源更新时间:{' '}
          {formatDate(intro.resourceUpdateTime, { isShowYear: true })}
        </span>
      </div>
      {intro.released && (
        <div className="flex items-center gap-2 text-sm text-default-500">
          <Calendar className="size-4" />
          <span>发售时间: {intro.released}</span>
        </div>
      )}
    </div>
  )
}
