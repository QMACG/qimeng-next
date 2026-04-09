import type { DocCommentClientInfo } from '~/types/api/doc'

const extractVersion = (ua: string, pattern: RegExp) => {
  const matched = ua.match(pattern)
  return matched?.[1]?.trim() ?? ''
}

const appendVersion = (name: string, version: string) =>
  version ? `${name} ${version}` : name

const detectBrowser = (ua: string) => {
  if (!ua) {
    return '未知浏览器'
  }

  if (/QQBrowser\/([\d.]+)/i.test(ua)) {
    return appendVersion('QQ浏览器', extractVersion(ua, /QQBrowser\/([\d.]+)/i))
  }
  if (/Quark\/([\d.]+)/i.test(ua)) {
    return appendVersion('夸克浏览器', extractVersion(ua, /Quark\/([\d.]+)/i))
  }
  if (/UCBrowser\/([\d.]+)/i.test(ua) || /UCWEB\/?([\d.]+)/i.test(ua)) {
    return appendVersion(
      'UC浏览器',
      extractVersion(ua, /(?:UCBrowser|UCWEB)\/?([\d.]+)/i)
    )
  }
  if (/MicroMessenger\/([\d.]+)/i.test(ua)) {
    return appendVersion('微信', extractVersion(ua, /MicroMessenger\/([\d.]+)/i))
  }
  if (/Weibo/i.test(ua)) {
    return '微博'
  }
  if (/AliApp\(AP\/([\d.]+)/i.test(ua)) {
    return appendVersion('支付宝', extractVersion(ua, /AliApp\(AP\/([\d.]+)/i))
  }
  if (/AliApp\(TB\/([\d.]+)/i.test(ua)) {
    return appendVersion('淘宝', extractVersion(ua, /AliApp\(TB\/([\d.]+)/i))
  }
  if (/HuaweiBrowser\/([\d.]+)/i.test(ua) || /HBPC\/([\d.]+)/i.test(ua)) {
    return appendVersion(
      '华为浏览器',
      extractVersion(ua, /(?:HuaweiBrowser|HBPC)\/([\d.]+)/i)
    )
  }
  if (/HeyTapBrowser\/([\d.]+)/i.test(ua)) {
    return appendVersion('OPPO浏览器', extractVersion(ua, /HeyTapBrowser\/([\d.]+)/i))
  }
  if (/VivoBrowser\/([\d.]+)/i.test(ua)) {
    return appendVersion('vivo浏览器', extractVersion(ua, /VivoBrowser\/([\d.]+)/i))
  }
  if (/MiuiBrowser\/([\d.]+)/i.test(ua)) {
    return appendVersion('小米浏览器', extractVersion(ua, /MiuiBrowser\/([\d.]+)/i))
  }
  if (/SamsungBrowser\/([\d.]+)/i.test(ua)) {
    return appendVersion(
      '三星浏览器',
      extractVersion(ua, /SamsungBrowser\/([\d.]+)/i)
    )
  }
  if (/MetaSr/i.test(ua) || /360SE/i.test(ua) || /360EE/i.test(ua)) {
    return '360浏览器'
  }
  if (/SE 2\.X/i.test(ua) || /SogouMobileBrowser\/([\d.]+)/i.test(ua)) {
    return appendVersion(
      '搜狗浏览器',
      extractVersion(ua, /SogouMobileBrowser\/([\d.]+)/i)
    )
  }
  if (/EdgA?\/([\d.]+)/i.test(ua)) {
    return appendVersion('Microsoft Edge', extractVersion(ua, /EdgA?\/([\d.]+)/i))
  }
  if (/Firefox\/([\d.]+)/i.test(ua)) {
    return appendVersion('Firefox', extractVersion(ua, /Firefox\/([\d.]+)/i))
  }
  if (/OPR\/([\d.]+)/i.test(ua) || /Opera\/([\d.]+)/i.test(ua)) {
    return appendVersion('Opera', extractVersion(ua, /(?:OPR|Opera)\/([\d.]+)/i))
  }
  if (/Brave\/([\d.]+)/i.test(ua)) {
    return appendVersion('Brave', extractVersion(ua, /Brave\/([\d.]+)/i))
  }
  if (/Chromium\/([\d.]+)/i.test(ua)) {
    return appendVersion('Chromium', extractVersion(ua, /Chromium\/([\d.]+)/i))
  }
  if (/Chrome\/([\d.]+)/i.test(ua) || /CriOS\/([\d.]+)/i.test(ua)) {
    return appendVersion('Chrome', extractVersion(ua, /(?:Chrome|CriOS)\/([\d.]+)/i))
  }
  if (/Safari\/([\d.]+)/i.test(ua)) {
    return appendVersion('Safari', extractVersion(ua, /Version\/([\d.]+)/i))
  }

  return '未知浏览器'
}

const detectWindowsVersion = (ua: string) => {
  if (/Windows NT 10\.0/i.test(ua)) {
    return 'Windows 10/11'
  }
  if (/Windows NT 6\.3/i.test(ua)) {
    return 'Windows 8.1'
  }
  if (/Windows NT 6\.2/i.test(ua)) {
    return 'Windows 8'
  }
  if (/Windows NT 6\.1/i.test(ua)) {
    return 'Windows 7'
  }
  if (/Windows NT 6\.0/i.test(ua)) {
    return 'Windows Vista'
  }
  if (/Windows NT 5\.1/i.test(ua)) {
    return 'Windows XP'
  }

  return 'Windows'
}

const detectOs = (ua: string) => {
  if (!ua) {
    return '未知系统'
  }

  if (/HarmonyOS|OpenHarmony/i.test(ua)) {
    return appendVersion('HarmonyOS', extractVersion(ua, /HarmonyOS[ /]?([\d.]+)/i))
  }
  if (/Windows/i.test(ua)) {
    return detectWindowsVersion(ua)
  }
  if (/Android ([\d.]+)/i.test(ua)) {
    return appendVersion('Android', extractVersion(ua, /Android ([\d.]+)/i))
  }
  if (/iPhone OS ([\d_]+)/i.test(ua)) {
    return appendVersion(
      'iPhone iOS',
      extractVersion(ua, /iPhone OS ([\d_]+)/i).replace(/_/g, '.')
    )
  }
  if (/iPad; CPU OS ([\d_]+)/i.test(ua)) {
    return appendVersion(
      'iPadOS',
      extractVersion(ua, /iPad; CPU OS ([\d_]+)/i).replace(/_/g, '.')
    )
  }
  if (/Mac OS X ([\d_]+)/i.test(ua)) {
    return appendVersion(
      'macOS',
      extractVersion(ua, /Mac OS X ([\d_]+)/i).replace(/_/g, '.')
    )
  }
  if (/Linux/i.test(ua)) {
    return 'Linux'
  }

  return '未知系统'
}

export const parseUserAgentSummary = (userAgent: string): DocCommentClientInfo => ({
  os: detectOs(userAgent),
  browser: detectBrowser(userAgent)
})
