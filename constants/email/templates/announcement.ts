import { kunMoyuMoe } from '~/config/moyu-moe'

const iconImage = `${kunMoyuMoe.domain.main}/favicon.ico`
const domain = kunMoyuMoe.domain.main

export const announcementTemplate = (
  title: string,
  content: string,
  email: string,
  validateEmailCode: string
) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #fef2f2; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #fee2e2;
      }
      .header {
        background: #dc2626;
        padding: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .header img {
        margin-right: 10px;
      }
      .content { padding: 32px; }
      .message {
        margin: 24px 0;
        padding: 16px;
        background: #fef2f2;
        border-radius: 8px;
        border-left: 4px solid #dc2626;
      }
      .footer {
        color: #6b7280;
        text-align: center;
        padding: 24px;
        font-size: 14px;
        border-top: 1px solid #fee2e2;
      }
      a {
        color: #dc2626;
      }
      @media only screen and (max-width: 480px) {
        .container { width: 100% !important; padding: 10px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <img src="${iconImage}" />
          <h1 style="color: white; margin: 0; font-size: 24px;">重要通知</h1>
        </div>
        <div class="content">
          <h2 style="color: #dc2626; margin: 0 0 16px 0; font-size: 20px;">${title}</h2>
          <div class="message">
            <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0;">
              ${content}
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">
            此邮件由系统自动发送，请勿直接回复。如有需要，请访问
            <a href="${kunMoyuMoe.domain.main}" target="_blank">${kunMoyuMoe.titleShort}</a>
          </p>
          <p style="margin: 12px 0 0;">
            如需取消邮件通知，请点击
            <a href="${domain}/auth/email-notice?email=${email}&code=${validateEmailCode}" target="_blank">退订邮件</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`
