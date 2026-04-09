import nodemailer, { type Transporter } from 'nodemailer'
import { convert } from 'html-to-text'

interface SendSiteEmailInput {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

let transporter: Transporter | null = null

const EMAIL_DELIVERY_FAILED = '邮件发送失败，请稍后重试'
const EMAIL_CONFIG_MISSING =
  '邮件配置不完整，请检查发信邮箱相关环境变量'
const EMAIL_PORT_INVALID =
  '邮件端口配置无效，请检查邮件端口环境变量'
const EMAIL_AUTH_FAILED =
  '邮件服务器认证失败，请检查邮箱账号和密码配置'
const EMAIL_NETWORK_FAILED =
  '邮件服务器连接失败，请检查主机、端口和网络配置'

const normalizeSmtpHost = (value: string) => {
  const trimmed = value.trim()

  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return new URL(trimmed).hostname
  }

  return trimmed.replace(/\/+$/, '')
}

const getSmtpPort = () => {
  const rawPort = process.env.KUN_VISUAL_NOVEL_EMAIL_PORT?.trim() || '587'
  const port = Number.parseInt(rawPort, 10)

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('Invalid email port')
  }

  return port
}

const getTransporter = () => {
  if (transporter) {
    return transporter
  }

  const host = normalizeSmtpHost(process.env.KUN_VISUAL_NOVEL_EMAIL_HOST || '')
  const account = process.env.KUN_VISUAL_NOVEL_EMAIL_ACCOUNT?.trim() || ''
  const password = process.env.KUN_VISUAL_NOVEL_EMAIL_PASSWORD || ''

  if (!host || !account || !password) {
    throw new Error('Missing email configuration')
  }

  const port = getSmtpPort()

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: account,
      pass: password
    }
  })

  return transporter
}

const getFromAddress = () => {
  const address = process.env.KUN_VISUAL_NOVEL_EMAIL_ACCOUNT?.trim() || ''
  const name = process.env.KUN_VISUAL_NOVEL_EMAIL_FROM?.trim() || ''

  if (!address) {
    throw new Error('Missing email account')
  }

  if (!name) {
    return address
  }

  return {
    name,
    address
  }
}

const createPlainText = (html: string) =>
  convert(html, {
    wordwrap: false,
    selectors: [
      {
        selector: 'a',
        options: {
          hideLinkHrefIfSameAsText: true
        }
      }
    ]
  }).trim()

export const sendSiteEmail = async (input: SendSiteEmailInput) => {
  const mailer = getTransporter()

  return mailer.sendMail({
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text?.trim() || createPlainText(input.html)
  })
}

export const getEmailErrorMessage = (error: unknown) => {
  console.error('Email delivery failed:', error)

  if (!(error instanceof Error)) {
    return EMAIL_DELIVERY_FAILED
  }

  const message = error.message

  if (/Missing email configuration|Missing email account/i.test(message)) {
    return EMAIL_CONFIG_MISSING
  }

  if (/Invalid email port/i.test(message)) {
    return EMAIL_PORT_INVALID
  }

  if (/auth|invalid login|login failed|535/i.test(message)) {
    return EMAIL_AUTH_FAILED
  }

  if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|ESOCKET/i.test(message)) {
    return EMAIL_NETWORK_FAILED
  }

  return EMAIL_DELIVERY_FAILED
}
