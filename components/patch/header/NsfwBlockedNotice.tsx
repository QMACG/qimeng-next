import Link from 'next/link'
import { Settings2 } from 'lucide-react'

interface Props {
  isLoggedIn: boolean
}

export const NsfwBlockedNotice = ({ isLoggedIn }: Props) => {
  const href = isLoggedIn ? '/settings/user' : '/login'
  const actionText = isLoggedIn ? '前往设置' : '前往登录'
  const description = isLoggedIn
    ? '这篇游戏当前未在你的内容显示范围内。前往设置调整后即可查看。'
    : '这篇游戏当前未在你的内容显示范围内。登录后可在设置中调整显示范围。'

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full overflow-hidden rounded-[2rem] border border-default-200/70 bg-content1 shadow-sm">
        <div className="bg-gradient-to-r from-warning-100/80 via-warning-50 to-background px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-warning-200/70 text-warning-900">
              <Settings2 className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium tracking-wide text-warning-900/80">
                内容显示范围
              </p>
              <h1 className="text-2xl font-bold text-foreground">当前内容暂未显示</h1>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
          <p className="max-w-2xl text-sm leading-7 text-default-600 sm:text-base">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={href}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              {actionText}
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-default-200 px-5 text-sm font-medium text-foreground transition hover:bg-default-100"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
