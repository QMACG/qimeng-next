export interface KunPostMetadata {
  id: number
  title: string
  banner: string
  directoryLabel: string
  date: string
  description: string
  textCount: number
  slug: string
  path: string
  category: string
  pin: boolean
}

export interface KunTreeNode {
  name: string
  label: string
  path: string
  children?: KunTreeNode[]
  type: 'file' | 'directory'
}

export interface KunFrontmatter {
  title: string
  banner: string
  directoryLabel: string
  description: string
  date: string
  authorUid: number
  authorName: string
  authorAvatar: string
  authorHomepage: string
  pin: boolean
  category: string
}

export interface KunBlog {
  id: number
  slug: string
  content: string
  frontmatter: KunFrontmatter
}
