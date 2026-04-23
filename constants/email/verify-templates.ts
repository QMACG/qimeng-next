import { kunMoyuMoe } from '~/config/moyu-moe'

const titleMap = {
  register: (siteName: string) => `欢迎注册 ${siteName}`,
  forgot: () => '找回密码',
  reset: () => '修改邮箱验证'
}

const messageMap = {
  register: (siteName: string) =>
    `感谢您注册 ${siteName}，请使用下面的验证码完成注册。`,
  forgot: () => '我们收到了您的密码重置请求，请使用下面的验证码继续操作。',
  reset: () => '您正在修改邮箱地址，请使用下面的验证码确认新的邮箱。'
}

export const createKunVerificationEmailTemplate = (
  type: 'register' | 'forgot' | 'reset',
  code: string
) => {
  const siteName = kunMoyuMoe.titleShort
  const titles = {
    register: titleMap.register(siteName),
    forgot: titleMap.forgot(),
    reset: titleMap.reset()
  }
  const messages = {
    register: messageMap.register(siteName),
    forgot: messageMap.forgot(),
    reset: messageMap.reset()
  }

  const iconImage = `${kunMoyuMoe.domain.main}/favicon.ico`
  const pageTitle = `${siteName} 邮箱验证码`
  const codeExpiresText = '验证码 10 分钟内有效。'
  const ignoreText = '如果这不是您的操作，请忽略这封邮件。'

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        width: 100% !important;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      img {
        max-width: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      h1 {
        padding-left: 10px;
        color: #27272a;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      .header {
        background: #e6f1fe;
        color: white;
        padding: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 14px 14px 0 0;
      }
      .content {
        background: #ffffff;
        padding: 40px 30px;
        text-align: center;
        border-radius: 0 0 14px 14px;
      }
      .code {
        font-size: 32px;
        letter-spacing: 4px;
        color: #006fee;
        background: #e4e4e7;
        padding: 16px 32px;
        border-radius: 8px;
        margin: 24px 0;
        display: inline-block;
      }
      .footer {
        color: #a1a1aa;
        font-size: 14px;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e4e4e7;
      }
      @media only screen and (max-width: 480px) {
        .container {
          width: 100% !important;
        }
        .content {
          padding: 30px 20px !important;
        }
        .code {
          font-size: 24px !important;
          padding: 12px 24px !important;
        }
      }
    </style>
  </head>
  <body style="background-color: #e4e4e7; padding: 40px 0">
    <div class="container">
      <div class="header">
        <img src="${iconImage}" />
        <h1 style="margin: 0; font-size: 24px; font-weight: 600">
          ${titles[type]}
        </h1>
      </div>
      <div class="content">
        <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
          ${messages[type]}
        </p>
        <div class="code">${code}</div>
        <p style="color: #374151; font-size: 14px; margin: 0;">
          ${codeExpiresText}
        </p>
        <div class="footer">
          <p style="margin: 0;">${ignoreText}</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `
}
