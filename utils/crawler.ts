const INDEXING_CRAWLER_USER_AGENT =
  /(googlebot|google-inspectiontool|bingbot|bingpreview|baiduspider|yandexbot|duckduckbot|slurp|sogou|360spider|bytespider|petalbot|applebot|facebookexternalhit|twitterbot|telegrambot|discordbot|linkedinbot|pinterestbot|ia_archiver|crawler|spider|bot|headlesschrome|prerender|lighthouse|playwright|puppeteer)/i

export const isIndexingCrawlerUserAgent = (userAgent?: string | null) => {
  if (!userAgent) {
    return false
  }

  return INDEXING_CRAWLER_USER_AGENT.test(userAgent)
}
