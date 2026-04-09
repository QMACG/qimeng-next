'use client'

import { Suspense } from 'react'
import { Alert, Chip } from '@heroui/react'
import { KunRedirectCard } from './KunRedirectCard'
import type { RedirectBoxAdvertisement } from '~/types/api/advertisement'

interface Props {
  advertisement: RedirectBoxAdvertisement | null
}

const isExternalLink = (link: string) => /^https?:\/\//i.test(link)

export const KunRedirectContainer = ({ advertisement }: Props) => {
  return (
    <div className="container mx-auto my-8 px-4 sm:px-6">
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-medium">外链访问确认</h1>
          <p className="text-default-500">
            请先确认目标链接可信，再继续访问站外页面。
          </p>
        </div>

        <Suspense>
          <KunRedirectCard />
        </Suspense>

        {advertisement ? (
          <a
            href={advertisement.link}
            target={isExternalLink(advertisement.link) ? '_blank' : undefined}
            rel={
              isExternalLink(advertisement.link)
                ? 'noopener noreferrer'
                : undefined
            }
            className="group block w-full max-w-2xl overflow-hidden rounded-[1.35rem] border border-divider bg-content1 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            referrerPolicy="no-referrer"
          >
            <div className="relative aspect-[16/5] overflow-hidden">
              <img
                src={advertisement.banner}
                alt="跳转页广告"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
              <div className="absolute left-4 top-4">
                <Chip size="sm" color="primary" variant="flat">
                  推广
                </Chip>
              </div>
            </div>
          </a>
        ) : null}

        <div className="w-full max-w-2xl">
          <Alert
            title="安全提示"
            description="本站不会要求你在跳转确认页下载额外程序。请仅访问你确认可信的目标站点。"
            color="warning"
            variant="faded"
          />
        </div>
      </div>
    </div>
  )
}
