import { AdminSetting } from '~/components/admin/setting/Container'
import { kunMetadata } from './metadata'
import {
  kunGetDisableRegisterStatusActions,
  kunGetFrontDisplayConfigActions,
  kunGetRedirectConfigActions,
  kunGetSiteAnalyticsScriptsActions
} from './actions'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import type { Metadata } from 'next'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

export default async function Kun() {
  const [setting, response, frontDisplay, siteAnalyticsScripts] =
    await Promise.all([
      kunGetRedirectConfigActions(),
      kunGetDisableRegisterStatusActions(),
      kunGetFrontDisplayConfigActions(),
      kunGetSiteAnalyticsScriptsActions()
    ])

  if (
    typeof response === 'string' ||
    typeof setting === 'string' ||
    typeof frontDisplay === 'string' ||
    typeof siteAnalyticsScripts === 'string'
  ) {
    const errorText =
      typeof response === 'string'
        ? response
        : typeof setting === 'string'
          ? setting
          : typeof frontDisplay === 'string'
            ? frontDisplay
            : typeof siteAnalyticsScripts === 'string'
              ? siteAnalyticsScripts
              : ''
    return <ErrorComponent error={errorText} />
  }

  return (
    <AdminSetting
      setting={setting}
      disableRegister={response.disableRegister}
      frontDisplay={frontDisplay}
      siteAnalyticsScripts={siteAnalyticsScripts}
    />
  )
}
