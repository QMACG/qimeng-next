import { getRemoteIp } from './getRemoteIp'
import { getKv, setKv } from '~/lib/redis'
import { generateRandomString } from '~/utils/random'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { createKunVerificationEmailTemplate } from '~/constants/email/verify-templates'
import { getEmailErrorMessage, sendSiteEmail } from './sendSiteEmail'

const EMAIL_SEND_TOO_FREQUENT = '邮件发送过于频繁，请 60 秒后再试'

const createSubjectMap = () => ({
  register: `欢迎注册 ${kunMoyuMoe.titleShort}`,
  forgot: `${kunMoyuMoe.titleShort} 密码找回验证码`,
  reset: `${kunMoyuMoe.titleShort} 邮箱修改验证码`
})

const createPlainTextMessage = (code: string) =>
  `您的验证码是：${code}，10 分钟内有效。`

export const sendVerificationCodeEmail = async (
  headers: Headers,
  email: string,
  type: 'register' | 'forgot' | 'reset'
) => {
  const ip = getRemoteIp(headers)

  const limitEmail = await getKv(`limit:email:${email}`)
  const limitIP = await getKv(`limit:ip:${ip}`)
  if (limitEmail || limitIP) {
    return EMAIL_SEND_TOO_FREQUENT
  }

  const code = generateRandomString(7)
  const subjects = createSubjectMap()

  try {
    await sendSiteEmail({
      to: email,
      subject: subjects[type],
      html: createKunVerificationEmailTemplate(type, code),
      text: createPlainTextMessage(code)
    })
  } catch (error) {
    return getEmailErrorMessage(error)
  }

  await setKv(email, code, 10 * 60)
  await setKv(`limit:email:${email}`, code, 60)
  await setKv(`limit:ip:${ip}`, code, 60)
}
