export const FEEDBACK_DOC_SLUG = 'help/feedback'
export const FEEDBACK_DOC_PATH = `/doc/${FEEDBACK_DOC_SLUG}`
export const FEEDBACK_COMMENTS_HASH = 'feedback-comments'

export const buildPatchFeedbackPrefill = (patchName: string) =>
  `反馈:${patchName}\n`
