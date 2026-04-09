export const FRIEND_LINK_STATUS = {
  pending: 0,
  normal: 1,
  hidden: 2
} as const

export type FriendLinkStatus =
  (typeof FRIEND_LINK_STATUS)[keyof typeof FRIEND_LINK_STATUS]

export const FRIEND_LINK_STATUS_OPTIONS = [
  { value: FRIEND_LINK_STATUS.pending, label: '未审核' },
  { value: FRIEND_LINK_STATUS.normal, label: '正常' },
  { value: FRIEND_LINK_STATUS.hidden, label: '隐藏' }
] as const

export const FRIEND_LINK_STATUS_LABEL_MAP: Record<number, string> = {
  [FRIEND_LINK_STATUS.pending]: '未审核',
  [FRIEND_LINK_STATUS.normal]: '正常',
  [FRIEND_LINK_STATUS.hidden]: '隐藏'
}

export const FRIEND_LINK_STATUS_COLOR_MAP: Record<
  number,
  'warning' | 'success' | 'default'
> = {
  [FRIEND_LINK_STATUS.pending]: 'warning',
  [FRIEND_LINK_STATUS.normal]: 'success',
  [FRIEND_LINK_STATUS.hidden]: 'default'
}
