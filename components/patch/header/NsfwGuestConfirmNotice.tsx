import Link from 'next/link'
import { Eye, ShieldAlert } from 'lucide-react'

interface Props {
  continueHref: string
}

export const NsfwGuestConfirmNotice = ({ continueHref }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full overflow-hidden rounded-[2rem] border border-default-200/70 bg-content1 shadow-sm">
        <div className="bg-gradient-to-r from-warning-100/80 via-warning-50 to-background px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-warning-200/70 text-warning-900">
              <ShieldAlert className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium tracking-wide text-warning-900/80">
                内容访问提示
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                当前内容不适合在公共场合访问
              </h1>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
          <p className="max-w-2xl text-sm leading-7 text-default-600 sm:text-base">
            当前内容不适合在公共场合访问。若你确认当前访问环境合适，可以继续查看；若处于公共场合，建议稍后再访问。
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={continueHref}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Eye className="mr-2 size-4" />
              继续查看
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
