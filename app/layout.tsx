import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
import { KunTopBar } from '~/components/kun/top-bar/TopBar'
import { KunFooter } from '~/components/kun/Footer'
import { KunNavigationBreadcrumb } from '~/components/kun/NavigationBreadcrumb'
import { generateKunMetadata, kunViewport } from './metadata'
import { KunBackToTop } from '~/components/kun/BackToTop'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { SiteAnalyticsScripts } from '~/components/site-analytics/SiteAnalyticsScripts'
import { getPublicSiteAnalyticsScripts } from '~/app/api/admin/setting/site-analytics/_shared'
import { getUserNameStyleConfig } from '~/app/api/admin/setting/user-name-style/_shared'
import { serializeJsonLd, toCanonicalUrl } from '~/utils/seo'
import type { Metadata, Viewport } from 'next'
import '~/styles/index.css'
import './actions'

export const viewport: Viewport = kunViewport
export const metadata: Metadata = generateKunMetadata()

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const analyticsScripts = await getPublicSiteAnalyticsScripts().catch(() => [])
  const userNameStyle = await getUserNameStyleConfig().catch(() => ({
    role1Color: '#a1a1aa',
    role2Color: '#2563eb',
    role3Color: '#d97706',
    role4Color: '#dc2626'
  }))

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
          <div className="relative flex flex-col items-center justify-center min-h-screen bg-radial">
            <KunTopBar />
            <KunNavigationBreadcrumb />
            <div className="flex min-h-[calc(100dvh-256px)] w-full max-w-7xl grow px-3 sm:px-6">
              {children}
              <Toaster />
            </div>
            <KunBackToTop />
            <KunFooter />
          </div>
        </Providers>
        <SiteAnalyticsScripts scripts={analyticsScripts} />
      </body>
    </html>
  )
}
