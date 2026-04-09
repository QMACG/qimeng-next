import { prisma } from '~/prisma/index'
import { FRIEND_LINK_STATUS } from '~/constants/friend-link'
import type { FriendLinkItem } from '~/types/api/friend-link'

export const mapFriendLink = (friendLink: {
  id: number
  name: string
  avatar: string
  description: string
  link: string
  status: number
  sort_order: number
  applicant_user_id: number | null
  created: Date
  updated: Date
  applicant?: {
    id: number
    name: string
  } | null
}): FriendLinkItem => ({
  id: friendLink.id,
  name: friendLink.name,
  avatar: friendLink.avatar,
  description: friendLink.description,
  link: friendLink.link,
  status: friendLink.status,
  sortOrder: friendLink.sort_order,
  applicantUserId: friendLink.applicant_user_id,
  applicantUserName: friendLink.applicant?.name ?? '',
  created: String(friendLink.created),
  updated: String(friendLink.updated)
})

export const getAdminFriendLinks = async () => {
  const links = await prisma.site_friend_link.findMany({
    orderBy: [{ status: 'asc' }, { sort_order: 'desc' }, { id: 'desc' }],
    include: {
      applicant: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return links.map(mapFriendLink)
}

export const getPublicFriendLinks = async () => {
  const links = await prisma.site_friend_link.findMany({
    where: {
      status: FRIEND_LINK_STATUS.normal
    },
    orderBy: [{ sort_order: 'desc' }, { id: 'desc' }],
    include: {
      applicant: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  return links.map(mapFriendLink)
}
