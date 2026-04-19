interface GalgameCard {
  id: number
  uniqueId: string
  name: string
  banner: string
  contentLimit: string
  view: number
  download: number
  showViewCount?: boolean
  showDownloadCount?: boolean
  shouldBlurForGuest?: boolean
  type: string[]
  language: string[]
  platform: string[]
  tags: string[]
  created: Date | string
  _count: {
    favorite_folder: number
    resource: number
    comment: number
  }
  averageRating?: number
}
