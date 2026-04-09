'use client'

import { useState, useEffect } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import 'yet-another-react-lightbox/styles.css'

interface Props {
  banner: string
  name: string
}

export const BannerImage = ({ banner, name }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [slides, setSlides] = useState<{ src: string }[]>([])

  useEffect(() => {
    setSlides([{ src: banner }])
  }, [banner])

  return (
    <>
      <img
        src={banner}
        alt={name}
        className="h-full w-full cursor-pointer object-cover"
        data-no-lightbox
        onClick={() => setIsOpen(true)}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
      />

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={slides}
        plugins={[Zoom, Download]}
        animation={{ fade: 300 }}
        carousel={{
          finite: true,
          preload: 2,
          imageProps: {
            style: {
              maxWidth: 'none',
              maxHeight: 'none',
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }
          }
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true
        }}
        controller={{
          closeOnBackdropClick: true
        }}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, .7)' } }}
      />
    </>
  )
}
