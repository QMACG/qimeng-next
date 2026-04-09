import { KunHeader } from '~/components/kun/Header'
import { Bio } from './Bio'
import { Email } from './Email'
import { EmailNotice } from './EmailNotice'
import { Password } from './Password'
import { Reset } from './Reset'
import { TwoFactorAuth } from './TwoFactorAuth'
import { UserAvatar } from './Avatar'
import { NsfwPreference } from './NsfwPreference'
import { Username } from './Username'

export const UserSettings = () => {
  return (
    <div className="my-4 w-full">
      <KunHeader name="账户设置" description="您可以在这里修改个人资料与安全设置" />

      <div className="m-auto max-w-3xl space-y-8">
        <UserAvatar />
        <Username />
        <Bio />
        <Email />
        <Password />
        <NsfwPreference />
        <EmailNotice />
        <TwoFactorAuth />
        <Reset />
      </div>
    </div>
  )
}
