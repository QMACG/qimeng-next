'use client'

import { Toaster } from 'react-hot-toast'
import { usePathname } from 'next/navigation'
import { KunTopBar } from '~/components/kun/top-bar/TopBar'
import { KunFooter } from '~/components/kun/Footer'
import { KunNavigationBreadcrumb } from '~/components/kun/NavigationBreadcrumb'
import { KunBackToTop } from '~/components/kun/BackToTop'
import { SiteAnalyticsScripts } from '~/components/site-analytics/SiteAnalyticsScripts'
import type { KunNavItem } from '~/constants/top-bar'
import type { AdminSiteAnalyticsScript } from '~/types/api/admin'

interface Props {
  enableSite: boolean
  siteCloseMessage: string
  initialPathname: string
  headerNavItems: KunNavItem[]
  analyticsScripts: AdminSiteAnalyticsScript[]
  children: React.ReactNode
}

const SITE_CLOSE_EXCLUDED_PATHS = ['/admin', '/login', '/register', '/auth']

const isSiteCloseExcludedPath = (pathname: string) =>
  SITE_CLOSE_EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

export const SiteAvailabilityLayout = ({
  enableSite,
  siteCloseMessage,
  initialPathname,
  headerNavItems,
  analyticsScripts,
  children
}: Props) => {
  const pathname = usePathname()
  const currentPathname = pathname || initialPathname
  const showSiteClosedPage =
    !enableSite && !isSiteCloseExcludedPath(currentPathname)

  if (showSiteClosedPage) {
    return (
      <>
        <div className="relative flex min-h-screen items-center justify-center bg-radial px-4 py-12">
          <div className="w-full max-w-2xl rounded-3xl border border-default-200 bg-content1/90 p-8 shadow-2xl backdrop-blur">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                Site Notice
              </p>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                站点暂时关闭
              </h1>
              <p className="whitespace-pre-wrap leading-8 text-default-600">
                {siteCloseMessage}
              </p>
            </div>
          </div>
          <Toaster />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-radial">
        <KunTopBar items={headerNavItems} />
        <KunNavigationBreadcrumb />
        <div className="flex min-h-[calc(100dvh-256px)] w-full max-w-7xl grow px-3 sm:px-6">
          {children}
          <Toaster />
        </div>
        <KunBackToTop />
        <KunFooter />
      </div>
      <SiteAnalyticsScripts scripts={analyticsScripts} />
    </>
  )
}
