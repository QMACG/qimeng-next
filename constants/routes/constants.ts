export interface KunBreadcrumbItem {
  key: string
  label: string
  href: string
  icon?: string
}

export const keyLabelMap: Record<string, string> = {
  '/': '首页',
  '/doc': '文章',
  '/company': '会社',
  '/company/[id]': '会社详情',
  '/admin': '后台管理',
  '/admin/galgame': '游戏管理',
  '/admin/galgame/new': '新建游戏',
  '/admin/doc': '文章管理',
  '/admin/doc/new': '新建文章',
  '/admin/doc/[id]': '编辑文章',
  '/admin/advertisement': '广告管理',
  '/admin/tag': '标签管理',
  '/admin/company': '会社管理',
  '/admin/comment': '评论管理',
  '/admin/log': '管理日志',
  '/admin/resource-note': '备注管理',
  '/admin/direct-download': '直链管理',
  '/admin/setting': '站点设置',
  '/admin/user': '用户管理',
  '/admin/feedback': '反馈管理',
  '/admin/report': '评论举报',
  '/admin/rating-report': '评分举报',
  '/admin/email': '邮件群发',
  '/auth/forgot': '找回密码',
  '/comment': '游戏评论',
  '/galgame': '游戏列表',
  '/login': '登录',
  '/message/follow': '关注消息',
  '/message/notice': '通知消息',
  '/message/chat': '私聊消息',
  '/message/system': '系统消息',
  '/message/mention': '提及消息',
  '/register': '注册',
  '/search': '搜索',
  '/settings/user': '账户设置',
  '/tag': '标签',
  '/tag/[id]': '标签详情',
  '/user/[id]/comment': '用户评论',
  '/user/[id]/favorite': '用户收藏',
  '/user/[id]/rating': '用户评分',
  '/ranking': '游戏排行榜'
}

export const dynamicRoutes = ['patch', 'tag', 'user']
