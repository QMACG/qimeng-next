export const GALGAME_AGE_LIMIT_MAP: Record<string, string> = {
  sfw: '常规内容',
  nsfw: '分级内容'
}

export const GALGAME_AGE_LIMIT_DETAIL: Record<string, string> = {
  sfw: '本文内容较为常规，适合在公开场景浏览。',
  nsfw: '本文可能包含分级内容，不建议在公开场景浏览。'
}

export const KUN_GALGAME_RATING_RECOMMEND_CONST = [
  'strong_no',
  'no',
  'neutral',
  'yes',
  'strong_yes'
] as const

export const KUN_GALGAME_RATING_RECOMMEND_MAP: Record<string, string> = {
  strong_no: '强烈不推荐',
  no: '不推荐',
  neutral: '中立',
  yes: '推荐',
  strong_yes: '强烈推荐'
}

export const KUN_GALGAME_RATING_SPOILER_CONST = [
  'none',
  'portion',
  'serious'
] as const

export const KUN_GALGAME_RATING_SPOILER_MAP: Record<string, string> = {
  none: '本评分无剧透',
  portion: '本评分含部分剧透',
  serious: '本评分含严重剧透'
}

export const KUN_GALGAME_RATING_PLAY_STATUS_CONST = [
  'not_started',
  'in_progress',
  'finished_one',
  'finished_main',
  'finished_all',
  'dropped'
] as const

export const KUN_GALGAME_RATING_PLAY_STATUS_MAP: Record<string, string> = {
  not_started: '未开始',
  in_progress: '游玩中',
  finished_one: '单线通关',
  finished_main: '主线通关',
  finished_all: '全线通关',
  dropped: '弃坑'
}
