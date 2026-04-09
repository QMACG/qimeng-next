'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { KunDesktopCard } from './DesktopCard'
import { KunMobileCard } from './MobileCard'
import type { HomeCarouselMetadata } from './mdx'

interface KunCarouselProps {
  posts: HomeCarouselMetadata[]
}

export const KunCarousel = ({ posts }: KunCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState(0)
  const [isPageVisible, setIsPageVisible] = useState(true)

  useEffect(() => {
    const handleVisibility = () => {
      const visible =
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible'

      setIsPageVisible(visible)

      if (visible) {
        setCurrentSlide((prev) =>
          posts.length > 0
            ? ((prev % posts.length) + posts.length) % posts.length
            : 0
        )
        setDirection(0)
      }
    }
    handleVisibility()

    document.addEventListener('visibilitychange', handleVisibility)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility)
  }, [posts.length])

  useEffect(() => {
    if (isHovered || !isPageVisible || posts.length === 0) {
      return
    }

    const timer = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) =>
        posts.length > 0 ? (prev + 1) % posts.length : 0
      )
    }, 5000)

    return () => clearInterval(timer)
  }, [isHovered, isPageVisible, posts.length])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentSlide(
      (prev) => (prev + newDirection + posts.length) % posts.length
    )
  }

  if (!posts.length) {
    return (
      <div className="relative flex h-[200px] items-center justify-center rounded-2xl border border-default-200 bg-default-50 text-default-500 sm:h-[300px]">
        暂无可展示的轮播文章
      </div>
    )
  }

  return (
    <div
      className="group relative flex h-[200px] touch-pan-y items-end overflow-hidden sm:h-[300px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div aria-hidden className="hidden">
        {posts.map((post, i) => (
          <img key={i} src={post.banner} alt="" />
        ))}
      </div>

      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', duration: 0.4, ease: 'easeInOut' },
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
          className="absolute h-full w-full cursor-grab active:cursor-grabbing"
        >
          <KunDesktopCard posts={posts} currentSlide={currentSlide} />

          <KunMobileCard posts={posts} currentSlide={currentSlide} />
        </motion.div>
      </AnimatePresence>

      <button
        className="absolute left-2 top-1/2 z-10 rounded-full bg-background/20 p-1.5 backdrop-blur-sm transition-all hover:bg-background/40 touch:opacity-100 group-hover:opacity-100 opacity-0 -translate-y-1/2"
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        className="absolute right-2 top-1/2 z-10 rounded-full bg-background/20 p-1.5 backdrop-blur-sm transition-all hover:bg-background/40 touch:opacity-100 group-hover:opacity-100 opacity-0 -translate-y-1/2"
        onClick={() => paginate(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 sm:bottom-2">
        {posts.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-primary w-4'
                : 'bg-foreground/20 hover:bg-foreground/40'
            }`}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1)
              setCurrentSlide(index)
            }}
          />
        ))}
      </div>
    </div>
  )
}
