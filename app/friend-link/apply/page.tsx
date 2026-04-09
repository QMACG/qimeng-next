import type { Metadata } from 'next'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { FriendLinkApplyForm } from '~/components/friend-link/ApplyForm'
import { kunMoyuMoe } from '~/config/moyu-moe'

export const metadata: Metadata = {
  title: '申请友情链接',
  description: `在 ${kunMoyuMoe.titleShort} 提交友情链接申请，审核通过后将展示在友情链接页面。`,
  alternates: {
    canonical: `${kunMoyuMoe.domain.main}/friend-link/apply`
  }
}

export default async function FriendLinkApplyPage() {
  const payload = await verifyHeaderCookie()

  return <FriendLinkApplyForm isLoggedIn={Boolean(payload)} />
}
