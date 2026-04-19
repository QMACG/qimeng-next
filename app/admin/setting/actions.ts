'use server'

import { GET as getDisableRegisterRoute } from '~/app/api/admin/setting/register/route'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { getHomeAnnouncementConfig } from '~/app/api/admin/setting/home-announcement/getHomeAnnouncementConfig'
import { getHeaderNavConfig } from '~/app/api/admin/setting/header-nav/_shared'
import { getRedirectConfig } from '~/app/api/admin/setting/redirect/getRedirectConfig'
import { getAdminSiteAnalyticsScripts } from '~/app/api/admin/setting/site-analytics/_shared'
import { getResourceNoteConfig } from '~/app/api/admin/setting/resource-note/getResourceNoteConfig'
import { getUserNameStyleConfig } from '~/app/api/admin/setting/user-name-style/_shared'
import { callRouteGet } from '~/utils/actions/callRouteHandler'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'

const verifyAdmin = async () => {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登录已失效'
  }
  if (payload.role < 3) {
    return '当前页面仅管理员可访问'
  }

  return payload
}

export const kunGetRedirectConfigActions = async () => {
  const payload = await verifyAdmin()
  if (typeof payload === 'string') {
    return payload
  }

  return getRedirectConfig()
}

export const kunGetDisableRegisterStatusActions = async () => {
  const payload = await verifyAdmin()
  if (typeof payload === 'string') {
    return payload
  }

  return callRouteGet(getDisableRegisterRoute, '/api/admin/setting/register')
}

export const kunGetResourceNoteConfigActions = async () => {
  const payload = await verifyAdmin()
  if (typeof payload === 'string') {
    return payload
  }

  return getResourceNoteConfig()
}

export const kunGetFrontDisplayConfigActions = async () => {
  const payload = await verifyAdmin()
  if (typeof payload === 'string') {
    return payload
  }

  return getFrontDisplayConfig()
}

export const kunGetHomeAnnouncementConfigActions = async () => {
  const payload = await verifyAdmin()
  if (typeof payload === 'string') {
    return payload
  }

  return getHomeAnnouncementConfig()
}

export const kunGetHeaderNavConfigActions = async () => {
  const payload = await verifyAdmin()
  if (typeof payload === 'string') {
    return payload
  }

  return getHeaderNavConfig()
}

export const kunGetSiteAnalyticsScriptsActions = async () => {
  const payload = await verifyAdmin()
  if (typeof payload === 'string') {
    return payload
  }

  return getAdminSiteAnalyticsScripts()
}

export const kunGetUserNameStyleConfigActions = async () => {
  const payload = await verifyAdmin()
  if (typeof payload === 'string') {
    return payload
  }

  return getUserNameStyleConfig()
}
