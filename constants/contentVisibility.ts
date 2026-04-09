export const CONTENT_VISIBILITY = {
  draft: 0,
  public: 1,
  hidden: 2,
  private: 3
} as const

export type ContentVisibility =
  (typeof CONTENT_VISIBILITY)[keyof typeof CONTENT_VISIBILITY]

export const CONTENT_VISIBILITY_OPTIONS = [
  { value: CONTENT_VISIBILITY.draft, label: '草稿' },
  { value: CONTENT_VISIBILITY.public, label: '公开' },
  { value: CONTENT_VISIBILITY.hidden, label: '隐藏' },
  { value: CONTENT_VISIBILITY.private, label: '私有' }
] as const

export const CONTENT_VISIBILITY_LABEL_MAP: Record<number, string> = {
  [CONTENT_VISIBILITY.draft]: '草稿',
  [CONTENT_VISIBILITY.public]: '公开',
  [CONTENT_VISIBILITY.hidden]: '隐藏',
  [CONTENT_VISIBILITY.private]: '私有'
}

export const CONTENT_VISIBILITY_COLOR_MAP: Record<
  number,
  'default' | 'success' | 'warning' | 'secondary'
> = {
  [CONTENT_VISIBILITY.draft]: 'default',
  [CONTENT_VISIBILITY.public]: 'success',
  [CONTENT_VISIBILITY.hidden]: 'warning',
  [CONTENT_VISIBILITY.private]: 'secondary'
}
