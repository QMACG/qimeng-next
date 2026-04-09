import { SUPPORTED_TYPE_MAP } from '~/constants/resource'
import type { KunSiteConfig } from './config'

const ensureAbsoluteUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const normalizeUrl = (url: string) => ensureAbsoluteUrl(url).replace(/\/+$/, '')

const parseSiteUrls = (value: string | undefined) => {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((item) => normalizeUrl(item))
    .filter(Boolean)
}

const fallbackSiteUrl =
  process.env.KUN_VISUAL_NOVEL_SITE_URL ||
  process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD ||
  process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV ||
  'http://127.0.0.1:3000'

const primarySiteUrl = normalizeUrl(fallbackSiteUrl)

const siteUrls = Array.from(
  new Set([
    primarySiteUrl,
    ...parseSiteUrls(process.env.KUN_VISUAL_NOVEL_SITE_URLS)
  ])
)

const siteName = '绮梦'
const siteMention = '@qimengacg'
const siteSubtitle = '免费galgame资源下载'
const siteTitle = `${siteName} - ${siteSubtitle}`
const siteImage = `${primarySiteUrl}/favicon.ico`
const siteDescription = '专注分享次元世界-Galgame'
const siteNav = normalizeUrl(process.env.KUN_VISUAL_NOVEL_NAV_URL || primarySiteUrl)
const telegramGroup = process.env.KUN_VISUAL_NOVEL_TELEGRAM_GROUP_URL || ''
const githubRepo = normalizeUrl(process.env.KUN_VISUAL_NOVEL_GITHUB_REPO_URL || '')
const siteKeywords = [
  '绮梦',
  'GalGame',
  '下载',
  '免费',
  'gal',
  ...Object.values(SUPPORTED_TYPE_MAP)
]

export const kunMoyuMoe: KunSiteConfig = {
  title: siteTitle,
  titleShort: siteName,
  template: `%s - ${siteName}`,
  description: siteDescription,
  keywords: siteKeywords,
  canonical: primarySiteUrl,
  author: [{ name: siteName, url: primarySiteUrl }],
  creator: {
    name: siteName,
    mention: siteMention,
    url: primarySiteUrl
  },
  publisher: {
    name: siteName,
    mention: siteMention,
    url: primarySiteUrl
  },
  domain: {
    main: primarySiteUrl,
    aliases: siteUrls.filter((url) => url !== primarySiteUrl),
    telegram_group: telegramGroup,
    nav: siteNav,
    github_repo: githubRepo
  },
  og: {
    title: siteTitle,
    description: siteDescription,
    image: siteImage,
    url: primarySiteUrl
  },
  images: [
    {
      url: siteImage,
      width: 256,
      height: 256,
      alt: siteTitle
    }
  ]
}
