import type { PatchComment } from './comment'

export interface HomeCarousel {
  id: number
  galgameTitle: string
  description: string
  type: string[]
  language: string[]
  platform: string[]
}

export type HomeComment = PatchComment
