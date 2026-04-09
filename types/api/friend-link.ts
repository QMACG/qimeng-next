export interface FriendLinkItem {
  id: number
  name: string
  avatar: string
  description: string
  link: string
  status: number
  sortOrder: number
  applicantUserId: number | null
  applicantUserName: string
  created: string
  updated: string
}
