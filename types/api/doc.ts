export interface DocPost {
  id: number
  slug: string
  title: string
  banner: string
  directoryLabel: string
  description: string
  content: string
  category: string
  status: number
  pin: boolean
  sortOrder: number
  publishedAt: string
  authorName: string
  authorAvatar: string
  authorHomepage: string
  authorId: number | null
  created: string
  updated: string
}

export interface DocComment {
  id: number
  docPostId: number
  parentId: number | null
  content: string
  status: number
  created: string
  updated: string
  user: KunUser
  reply: DocComment[]
}

export interface DocCommentResponse {
  comments: DocComment[]
  total: number
}
