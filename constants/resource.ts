export const resourceTypes = [
  {
    value: 'pc',
    label: 'PC 游戏',
    description: '适用于 Windows、macOS 等桌面平台的游戏作品'
  },
  {
    value: 'row',
    label: '原版资源',
    description: '未汉化的原始游戏版本'
  },
  {
    value: 'chinese',
    label: '汉化资源',
    description: '包含简体或繁体中文支持的版本'
  },
  {
    value: 'mobile',
    label: '手机游戏',
    description: '适用于手机端的游戏内容'
  },
  {
    value: 'emulator',
    label: '模拟器资源',
    description: '适用于模拟器环境运行的游戏版本'
  },
  {
    value: 'app',
    label: '直装资源',
    description: '可直接安装运行的资源包'
  },
  {
    value: 'tool',
    label: '游戏工具',
    description: '辅助游戏运行或处理资源的工具'
  },
  {
    value: 'notice',
    label: '官方通知',
    description: '与站点维护或作品发布相关的通知'
  },
  {
    value: 'other',
    label: '其他',
    description: '未归类的其他内容'
  }
]

export const SUPPORTED_TYPE = [
  'pc',
  'chinese',
  'mobile',
  'emulator',
  'row',
  'app',
  'tool',
  'notice',
  'other'
]

export const SUPPORTED_TYPE_MAP: Record<string, string> = {
  all: '全部类型',
  pc: 'PC 游戏',
  chinese: '汉化资源',
  mobile: '手机游戏',
  emulator: '模拟器资源',
  row: '原版资源',
  app: '直装资源',
  tool: '游戏工具',
  notice: '官方通知',
  other: '其他'
}

export const ALL_SUPPORTED_TYPE = ['all', ...SUPPORTED_TYPE]

export const SUPPORTED_LANGUAGE = ['zh-Hans', 'zh-Hant', 'ja', 'en', 'other']
export const ALL_SUPPORTED_LANGUAGE = ['all', ...SUPPORTED_LANGUAGE]
export const SUPPORTED_LANGUAGE_MAP: Record<string, string> = {
  all: '全部语言',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁体中文',
  ja: '日语',
  en: '英语',
  other: '其他'
}

export const SUPPORTED_PLATFORM = [
  'windows',
  'android',
  'macos',
  'ios',
  'linux',
  'other'
]
export const ALL_SUPPORTED_PLATFORM = ['all', ...SUPPORTED_PLATFORM]
export const SUPPORTED_PLATFORM_MAP: Record<string, string> = {
  all: '全部平台',
  windows: 'Windows',
  android: 'Android',
  macos: 'macOS',
  ios: 'iOS',
  linux: 'Linux',
  other: '其他'
}

export const SUPPORTED_RESOURCE_LINK = [
  'baidu',
  'quark',
  'uc',
  'xunlei',
  'mobile',
  'custom',
  'direct'
]

export const NETDISK_STORAGE_TYPES = [
  {
    value: 'baidu',
    label: '百度网盘',
    description: '百度网盘分享链接'
  },
  {
    value: 'quark',
    label: '夸克网盘',
    description: '夸克网盘分享链接'
  },
  {
    value: 'uc',
    label: 'UC 网盘',
    description: 'UC 网盘分享链接'
  },
  {
    value: 'xunlei',
    label: '迅雷网盘',
    description: '迅雷网盘分享链接'
  },
  {
    value: 'mobile',
    label: '移动网盘',
    description: '移动云盘分享链接'
  },
  {
    value: 'custom',
    label: '其他网盘',
    description: '其他网盘或分享平台链接'
  }
] as const

export const DIRECT_STORAGE_TYPES = [
  {
    value: 'direct',
    label: '直链',
    description: '自建网盘、对象存储或文件服务器直链'
  }
] as const

export const storageTypes = [...NETDISK_STORAGE_TYPES, ...DIRECT_STORAGE_TYPES]

export const SUPPORTED_RESOURCE_LINK_MAP: Record<string, string> = {
  baidu: '百度网盘',
  quark: '夸克网盘',
  uc: 'UC 网盘',
  xunlei: '迅雷网盘',
  mobile: '移动网盘',
  custom: '其他网盘',
  direct: '直链'
}

export const ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-lz4',
  'application/x-rar-compressed'
]

export const ALLOWED_EXTENSIONS = ['.zip', '.rar', '.7z']

export const SUPPORTED_RESOURCE_SECTION = ['netdisk', 'direct']

export const RESOURCE_SECTION_MAP: Record<string, string> = {
  netdisk: '网盘资源',
  direct: '直链资源'
}
