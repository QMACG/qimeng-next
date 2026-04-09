import { kunMoyuMoe } from '~/config/moyu-moe'

const iconImage = `${kunMoyuMoe.domain.main}/favicon.ico`
const domain = kunMoyuMoe.domain.main

export const siteTemplate = (
  title: string,
  content: string,
  email: string,
  validateEmailCode: string
) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${kunMoyuMoe.titleShort}</title>
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
      .footer {
        margin-top: 30px;
        color: #a1a1aa;
        text-align: center;
        padding: 24px;
        font-size: 14px;
        border-top: 1px solid #e4e4e7;
      }
      a {
        color: #006fee;
      }
      @media only screen and (max-width: 480px) {
        .container {
          width: 100% !important;
        }
        .content {
          padding: 30px 20px !important;
        }
      }
    </style>
  </head>
  <body style="background-color: #e4e4e7; padding: 40px 0">
    <div class="container">
      <div class="header">
        <img src="${iconImage}" />
        <h1 style="margin: 0; font-size: 24px; font-weight: 600">
          ${title}
        </h1>
      </div>
      <div class="content">
        ${content}
        <div class="footer">
          <p style="margin: 0;">
            此邮件由系统自动发送，请勿直接回复。如有问题，请访问
            <a href="${kunMoyuMoe.domain.main}" target="_blank">${kunMoyuMoe.titleShort}</a>
          </p>
          <p style="margin: 0;">
            如需取消邮件通知，请点击
            <a href="${domain}/auth/email-notice?email=${email}&code=${validateEmailCode}" target="_blank">退订邮件</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`
