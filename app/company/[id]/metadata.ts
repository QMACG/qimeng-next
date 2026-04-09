import { kunMoyuMoe } from '~/config/moyu-moe'
import type { Metadata } from 'next'
import type { CompanyDetail } from '~/types/api/company'

export const generateKunMetadataTemplate = (
  company: CompanyDetail
): Metadata => {
  const title = `${company.name} - 会社详情`
  const description =
    company.introduction ||
    `查看 ${company.name} 在 ${kunMoyuMoe.titleShort} 中收录的游戏、别名与基础资料。`

  return {
    title,
    description,
    openGraph: {
      title: `${company.name} | ${kunMoyuMoe.titleShort}`,
      description,
      type: 'article',
      publishedTime: new Date(company.created).toISOString(),
      modifiedTime: new Date(company.created).toISOString(),
      tags: company.alias
    },
    twitter: {
      card: 'summary',
      title: `${company.name} | ${kunMoyuMoe.titleShort}`,
      description
    },
    alternates: {
      canonical: `${kunMoyuMoe.domain.main}/company/${company.id}`
    },
    keywords: [company.name, ...company.alias]
  }
}
