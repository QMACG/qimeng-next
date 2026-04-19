'use client'

import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { KunCardStats } from '~/components/kun/CardStats'
import Link from 'next/link'
import { KunPatchAttribute } from '~/components/kun/PatchAttribute'
import { Star } from 'lucide-react'
import type { CSSProperties } from 'react'

interface Props {
  patch: GalgameCard
  openOnNewTab?: boolean
}

const blurredCoverImageStyle: CSSProperties = {
  filter: 'blur(8px) saturate(1.02) brightness(0.99)',
  transform: 'scale(1.08)'
}

const frostedOverlayStyle: CSSProperties = {
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  background: 'rgba(255, 255, 255, 0.03)'
}

export const GalgameCard = ({ patch, openOnNewTab = false }: Props) => {
  const coverSrc = patch.banner || '/favicon.ico'

  return (
    <Card
      isPressable
      as={Link}
      href={`/${patch.uniqueId}`}
      target={openOnNewTab ? '_blank' : '_self'}
      className="w-full border border-default-100 dark:border-default-200"
    >
      <CardHeader className="p-0">
        <div className="relative w-full overflow-hidden rounded-t-lg">
          <div className="relative aspect-video bg-default-100">
            {patch.shouldBlurForGuest ? (
              <>
                <img
                  alt={patch.name}
                  src={coverSrc}
                  className="absolute inset-0 h-full w-full object-cover opacity-55"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <img
                  alt=""
                  aria-hidden="true"
                  src={coverSrc}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={blurredCoverImageStyle}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute inset-0 z-[1] dark:bg-black/10"
                  style={frostedOverlayStyle}
                />
                <div className="absolute inset-0 z-[2] bg-gradient-to-br from-white/4 via-transparent to-black/3" />
              </>
            ) : (
              <img
                alt={patch.name}
                src={coverSrc}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            )}

            {patch.averageRating !== 0 && (
              <div className="absolute right-2 top-2 z-10">
                <span className="flex items-center gap-1 rounded-2xl bg-warning-600/90 px-2 text-background">
                  <Star className="h-4 w-4" />
                  {patch.averageRating}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="justify-between space-y-2">
        <h2 className="line-clamp-2 font-semibold text-small transition-colors hover:text-primary-500 sm:text-lg">
          {patch.name}
        </h2>
        <KunCardStats patch={patch} isMobile />
      </CardBody>
      <CardFooter className="pt-0">
        <KunPatchAttribute types={patch.type} size="sm" />
      </CardFooter>
    </Card>
  )
}
