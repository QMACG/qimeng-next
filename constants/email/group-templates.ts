import { kunMoyuMoe } from '~/config/moyu-moe'
import { announcementTemplate } from './templates/announcement'
import { siteTemplate } from './templates/site'

export interface EmailTemplate {
  id: string
  name: string
  template: string
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'site',
    name: `${kunMoyuMoe.titleShort} 站点消息`,
    template: siteTemplate(
      '{{title}}',
      '{{content}}',
      '{{email}}',
      '{{validateEmailCode}}'
    )
  },
  {
    id: 'announcement',
    name: `${kunMoyuMoe.titleShort} 重要通知`,
    template: announcementTemplate(
      '{{title}}',
      '{{content}}',
      '{{email}}',
      '{{validateEmailCode}}'
    )
  }
]
