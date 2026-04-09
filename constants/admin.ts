import type { OverviewData } from '~/types/api/admin'

export const APPLICANT_STATUS_MAP: Record<number, string> = {
  0: '待处理',
  1: '已查看',
  2: '已通过',
  3: '已拒绝'
}

export const RESOURCE_STATUS_MAP: Record<number, string> = {
  0: '正常',
  1: '已屏蔽',
  2: '待审核'
}

export const ADMIN_LOG_TYPE_MAP: Record<string, string> = {
  create: '创建',
  delete: '删除',
  approve: '通过',
  decline: '拒绝',
  update: '更新'
}

export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/wmv', 'video/webm']

export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.wmv', '.webm']

export const ADMIN_STATS_MAP: Record<keyof OverviewData, string> = {
  newUser: '新增用户',
  newActiveUser: '新增活跃用户',
  newGalgame: '新增游戏',
  newGalgameResource: '新增下载项',
  newComment: '新增评论'
}

export const ADMIN_STATS_SUM_MAP: Record<string, string> = {
  userCount: '用户总数',
  galgameCount: '游戏总数',
  galgameResourceCount: '网盘下载项数',
  galgamePatchResourceCount: '直链下载项数',
  galgameCommentCount: '评论总数'
}
