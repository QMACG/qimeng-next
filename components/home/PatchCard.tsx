import Link from 'next/link'
import { Card, CardBody } from '@heroui/card'
import { KunCardStats } from '~/components/kun/CardStats'
import type { CSSProperties } from 'react'

interface Props {
  patch: GalgameCard
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

export const PatchCard = ({ patch }: Props) => {
  const coverSrc = patch.banner || '/favicon.ico'

  return (
    <Card
      isPressable
      as={Link}
      href={`/${patch.uniqueId}`}
      className="w-full border border-default-100 dark:border-default-200"
    >
      <CardBody>
        <div className="relative overflow-hidden rounded-lg">
          <div className="relative aspect-video bg-default-100">
            {patch.shouldBlurForGuest ? (
              <>
                <img
                  src={coverSrc}
                  alt={patch.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-55"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <img
                  src={coverSrc}
                  alt=""
                  aria-hidden="true"
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
                src={coverSrc}
                alt={patch.name}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
        <div className="mt-3 space-y-3">
          <h2 className="line-clamp-2 text-lg font-semibold transition-colors hover:text-primary-500">
            {patch.name}
          </h2>
          <KunCardStats patch={patch} isMobile />
        </div>
      </CardBody>
    </Card>
  )
}
