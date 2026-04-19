import type { Metadata } from 'next'
import { AdminSetting } from '~/components/admin/setting/Container'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { kunMetadata } from './metadata'
import {
  kunGetDisableRegisterStatusActions,
  kunGetFrontDisplayConfigActions,
  kunGetHeaderNavConfigActions,
  kunGetHomeAnnouncementConfigActions,
  kunGetRedirectConfigActions,
  kunGetSiteAnalyticsScriptsActions,
  kunGetUserNameStyleConfigActions
} from './actions'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

export default async function Kun() {
  const [
    setting,
    response,
    frontDisplay,
    homeAnnouncement,
    headerNav,
    siteAnalyticsScripts,
    userNameStyle
  ] = await Promise.all([
    kunGetRedirectConfigActions(),
    kunGetDisableRegisterStatusActions(),
    kunGetFrontDisplayConfigActions(),
    kunGetHomeAnnouncementConfigActions(),
    kunGetHeaderNavConfigActions(),
    kunGetSiteAnalyticsScriptsActions(),
    kunGetUserNameStyleConfigActions()
  ])

  if (
    typeof response === 'string' ||
    typeof setting === 'string' ||
    typeof frontDisplay === 'string' ||
    typeof homeAnnouncement === 'string' ||
    typeof headerNav === 'string' ||
    typeof siteAnalyticsScripts === 'string' ||
    typeof userNameStyle === 'string'
  ) {
    const errorText =
      typeof response === 'string'
        ? response
        : typeof setting === 'string'
          ? setting
          : typeof frontDisplay === 'string'
            ? frontDisplay
            : typeof homeAnnouncement === 'string'
              ? homeAnnouncement
              : typeof headerNav === 'string'
                ? headerNav
                : typeof siteAnalyticsScripts === 'string'
                  ? siteAnalyticsScripts
                  : typeof userNameStyle === 'string'
                    ? userNameStyle
                    : ''

    return <ErrorComponent error={errorText} />
  }

  return (
    <AdminSetting
      setting={setting}
      disableRegister={response.disableRegister}
      frontDisplay={frontDisplay}
      homeAnnouncement={homeAnnouncement}
      headerNav={headerNav}
      siteAnalyticsScripts={siteAnalyticsScripts}
      userNameStyle={userNameStyle}
    />
  )
}
