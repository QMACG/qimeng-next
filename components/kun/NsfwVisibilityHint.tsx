'use client'

import Link from 'next/link'
import { useUserStore } from '~/store/userStore'

interface Props {
  count: number
}

export const NsfwVisibilityHint = ({ count }: Props) => {
  const user = useUserStore((state) => state.user)

  if (count <= 0) {
    return null
  }

  const isLoggedIn = user.uid > 0
  const href = isLoggedIn ? '/settings/user' : '/login'

  return (
    <div className="rounded-3xl border border-warning-200/80 bg-warning-50/80 px-4 py-3 text-sm text-warning-900 shadow-sm">
      当前列表还有内容未显示。
      {isLoggedIn
        ? ' 你可以前往设置调整内容显示范围后再查看。'
        : ' 请先登录，再到设置中调整内容显示范围。'}
      <Link
        href={href}
        className="ml-2 font-medium text-warning-950 underline underline-offset-4"
      >
        {isLoggedIn ? '前往设置' : '前往登录'}
      </Link>
    </div>
  )
}
