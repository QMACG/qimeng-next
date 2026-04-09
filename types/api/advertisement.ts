export type AdvertisementKind = 'home_box' | 'featured_post' | 'redirect_box'
export type FeaturedAdvertisementTargetMode = 'article' | 'external'

export interface AdvertisementDocCandidate {
  id: number
  title: string
  slug: string
  banner: string
  description: string
  status: number
  directoryLabel: string
  publishedAt: string
}

export interface AdminAdvertisement {
  id: number
  kind: AdvertisementKind
  title: string
  banner: string
  link: string
  targetMode: FeaturedAdvertisementTargetMode | null
  visibleForGuest: boolean
  sortOrder: number
  slot: number | null
  docPostId: number | null
  created: string
  updated: string
  docPost: AdvertisementDocCandidate | null
}

export interface HomeBoxAdvertisement {
  id: number
  banner: string
  link: string
  slot: number
}

export interface RedirectBoxAdvertisement {
  id: number
  banner: string
  link: string
}
