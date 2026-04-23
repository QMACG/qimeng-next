export const FEEDBACK_COMMENT_STATUS = {
  pending: 0,
  inProgress: 1,
  resolved: 2,
  suspended: 3,
  closed: 4
} as const

export type FeedbackCommentStatusValue =
  (typeof FEEDBACK_COMMENT_STATUS)[keyof typeof FEEDBACK_COMMENT_STATUS]

export type FeedbackCommentStatusKey =
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'suspended'
  | 'closed'

export const FEEDBACK_COMMENT_STATUS_VALUE_MAP: Record<
  FeedbackCommentStatusKey,
  FeedbackCommentStatusValue
> = {
  pending: FEEDBACK_COMMENT_STATUS.pending,
  in_progress: FEEDBACK_COMMENT_STATUS.inProgress,
  resolved: FEEDBACK_COMMENT_STATUS.resolved,
  suspended: FEEDBACK_COMMENT_STATUS.suspended,
  closed: FEEDBACK_COMMENT_STATUS.closed
}

export const FEEDBACK_COMMENT_STATUS_META: Record<
  FeedbackCommentStatusValue,
  {
    label: string
    color:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'danger'
  }
> = {
  [FEEDBACK_COMMENT_STATUS.pending]: {
    label: '待处理',
    color: 'warning'
  },
  [FEEDBACK_COMMENT_STATUS.inProgress]: {
    label: '处理中',
    color: 'primary'
  },
  [FEEDBACK_COMMENT_STATUS.resolved]: {
    label: '已处理',
    color: 'success'
  },
  [FEEDBACK_COMMENT_STATUS.suspended]: {
    label: '挂起',
    color: 'secondary'
  },
  [FEEDBACK_COMMENT_STATUS.closed]: {
    label: '关闭',
    color: 'danger'
  }
}

export const getFeedbackCommentStatusMeta = (status: number) =>
  FEEDBACK_COMMENT_STATUS_META[status as FeedbackCommentStatusValue] ??
  FEEDBACK_COMMENT_STATUS_META[FEEDBACK_COMMENT_STATUS.pending]
