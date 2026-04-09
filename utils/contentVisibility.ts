import { CONTENT_VISIBILITY } from '~/constants/contentVisibility'

interface ViewerContext {
  uid?: number
  role?: number
}

interface ContentOwnerContext extends ViewerContext {
  authorId?: number | null
  visibility: number
}

export const isPublicVisibility = (visibility: number) =>
  visibility === CONTENT_VISIBILITY.public

export const isHiddenVisibility = (visibility: number) =>
  visibility === CONTENT_VISIBILITY.hidden

export const isPrivateVisibility = (visibility: number) =>
  visibility === CONTENT_VISIBILITY.private

export const isDraftVisibility = (visibility: number) =>
  visibility === CONTENT_VISIBILITY.draft

export const isListedVisibility = (visibility: number) =>
  visibility === CONTENT_VISIBILITY.public

export const isDirectVisibleVisibility = (visibility: number) =>
  visibility === CONTENT_VISIBILITY.public ||
  visibility === CONTENT_VISIBILITY.hidden

export const canManageEditorialContent = (role = 0) => role >= 2

export const canAccessRestrictedContent = ({
  visibility,
  authorId,
  uid = 0,
  role = 0
}: ContentOwnerContext) => {
  if (isDirectVisibleVisibility(visibility)) {
    return true
  }

  if (canManageEditorialContent(role)) {
    return true
  }

  return Boolean(authorId && uid && authorId === uid)
}

