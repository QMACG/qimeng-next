import { headers } from 'next/headers'
import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import { generateKunMetadata, kunViewport } from './metadata'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { SiteAvailabilityLayout } from '~/components/site-availability/SiteAvailabilityLayout'
import { getPublicSiteAnalyticsScripts } from '~/app/api/admin/setting/site-analytics/_shared'
import { getUserNameStyleConfig } from '~/app/api/admin/setting/user-name-style/_shared'
import { getHeaderNavConfig } from '~/app/api/admin/setting/header-nav/_shared'
import { getFrontDisplayConfig } from '~/app/api/admin/setting/front-display/getFrontDisplayConfig'
import { DEFAULT_HEADER_NAV_ITEMS } from '~/constants/top-bar'
import { toPublicHeaderNavItems } from '~/utils/headerNav'
import { serializeJsonLd, toCanonicalUrl } from '~/utils/seo'
import '~/styles/index.css'
import './actions'

export const viewport: Viewport = kunViewport
export const metadata: Metadata = generateKunMetadata()

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const requestHeaders = await headers()
  const pathname = requestHeaders.get('x-pathname') ?? '/'
  const analyticsScripts = await getPublicSiteAnalyticsScripts().catch(() => [])
  const frontDisplayConfig = await getFrontDisplayConfig().catch(() => ({
    enableSite: true,
    siteCloseMessage: '',
    hideViewCountForVisitor: true,
    hideDownloadCountForVisitor: true,
    hideCreatorStatsForVisitor: true
  }))
  const userNameStyle = await getUserNameStyleConfig().catch(() => ({
    role1Color: '#a1a1aa',
    role2Color: '#2563eb',
    role3Color: '#d97706',
    role4Color: '#dc2626'
  }))
  const headerNav = await getHeaderNavConfig().catch(() => ({
    items: DEFAULT_HEADER_NAV_ITEMS
  }))
  const headerNavItems = toPublicHeaderNavItems(headerNav)
  const footerConfig = {
    titleShort: kunMoyuMoe.titleShort,
    navLink: kunMoyuMoe.domain.nav,
    githubRepo: kunMoyuMoe.domain.github_repo,
    telegramGroup: kunMoyuMoe.domain.telegram_group
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: kunMoyuMoe.titleShort,
    url: toCanonicalUrl('/'),
    description: kunMoyuMoe.description,
    inLanguage: 'zh-CN'
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: kunMoyuMoe.titleShort,
    url: toCanonicalUrl('/'),
    logo: toCanonicalUrl('/favicon.ico')
  }

  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <head>
        {process.env.KUN_VISUAL_NOVEL_TEST_SITE_LABEL && (
          <meta name="robots" content="noindex,nofollow" />
        )}
        {process.env.KUN_VISUAL_NOVEL_TEST_SITE_LABEL && (
          <meta name="googlebot" content="noindex,nofollow" />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(organizationJsonLd)
          }}
        />
        <style>{`:root{--user-role-1-color:${userNameStyle.role1Color};--user-role-2-color:${userNameStyle.role2Color};--user-role-3-color:${userNameStyle.role3Color};--user-role-4-color:${userNameStyle.role4Color};}`}</style>
      </head>

      <body>
        <Providers>
          <SiteAvailabilityLayout
            enableSite={frontDisplayConfig.enableSite}
            siteCloseMessage={frontDisplayConfig.siteCloseMessage}
            initialPathname={pathname}
            headerNavItems={headerNavItems}
            analyticsScripts={analyticsScripts}
            footerConfig={footerConfig}
          >
            {children}
          </SiteAvailabilityLayout>
        </Providers>
      </body>
    </html>
  )
}
