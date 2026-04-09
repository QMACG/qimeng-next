import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { patchCommentUpdateSchema } from '~/validations/patch'
import { auditTextContent } from '~/utils/contentAudit'

export const updateComment = async (
  input: z.infer<typeof patchCommentUpdateSchema>,
  uid: number,
  userRole: number,
  username: string
) => {
  const { commentId, content } = input

  const comment = await prisma.patch_comment.findUnique({
    where: { id: commentId }
  })
  if (!comment) {
    return '未找到这条评论'
  }

  if (comment.user_id !== uid && userRole < 3) {
    return '您没有权限修改这条评论'
  }

  const auditError = await auditTextContent({
    content,
    scenario: 'comment',
    identity: {
      uid,
      username
    }
  })
  if (auditError) {
    return auditError
  }

  await prisma.patch_comment.update({
    where: { id: commentId },
    data: {
      content,
      edit: Date.now().toString()
    }
  })

  return {}
}
