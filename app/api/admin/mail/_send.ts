import crypto from 'crypto'
import { setKv } from '~/lib/redis'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { emailTemplates } from '~/constants/email/group-templates'
import {
  getEmailErrorMessage,
  sendSiteEmail
} from '~/app/api/utils/sendSiteEmail'

const CACHE_KEY = 'auth:mail:notice'

const getEmailSubject = (selectedTemplate: string) => {
  const currentTemplate = emailTemplates.find((t) => t.id === selectedTemplate)
  if (!currentTemplate) {
    return kunMoyuMoe.titleShort
  }
  return `${kunMoyuMoe.titleShort} - ${currentTemplate.name}`
}

const getPreviewContent = (
  selectedTemplate: string,
  templateVars: Record<string, string>,
  email: string,
  validateEmailCode: string
) => {
  const currentTemplate = emailTemplates.find((t) => t.id === selectedTemplate)
  if (!currentTemplate) {
    return ''
  }

  const variables = {
    ...templateVars,
    email,
    validateEmailCode
  }

  let content = currentTemplate.template
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })

  return content
}

export const sendEmailHTML = async (
  templateId: string,
  variables: Record<string, string>,
  email: string
): Promise<string | undefined> => {
  const validateEmailCode = crypto.randomUUID()

  const content = getPreviewContent(
    templateId,
    variables,
    email,
    validateEmailCode
  )

  try {
    await sendSiteEmail({
      to: email,
      subject: getEmailSubject(templateId),
      html: content,
      text: '请在支持 HTML 的邮件客户端中查看此邮件。'
    })
  } catch (error) {
    return getEmailErrorMessage(error)
  }

  await setKv(`${CACHE_KEY}:${email}`, validateEmailCode, 7 * 24 * 60 * 60)
}
