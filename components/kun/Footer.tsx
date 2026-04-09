import Image from 'next/image'
import Link from 'next/link'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { KunExternalLink } from './external-link/ExternalLink'

const FOOTER_COPYRIGHT = '© 2026 '
const FOOTER_DOC = '文章'
const FOOTER_NAV = '站点导航'
const FOOTER_FRIEND = '友情链接'
const FOOTER_GITHUB = 'GitHub 仓库'
const FOOTER_LINK_CLASS =
  'flex items-center text-sm font-medium leading-none text-default-700 no-underline transition-colors hover:text-foreground'

export const KunFooter = () => {
  return (
    <footer className="mt-8 w-full border-t border-divider text-sm">
      <div className="mx-auto max-w-7xl px-2 sm:px-6">
        <div className="flex flex-wrap justify-center gap-4 py-6 md:justify-between">
          <Link href="/" className={FOOTER_LINK_CLASS}>
            <Image
              src="/favicon.ico"
              alt={kunMoyuMoe.titleShort}
              width={30}
              height={30}
            />
            <span className="ml-2">
              {FOOTER_COPYRIGHT}
              {kunMoyuMoe.titleShort}
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/doc" className={FOOTER_LINK_CLASS}>
              {FOOTER_DOC}
            </Link>
            <KunExternalLink
              link={kunMoyuMoe.domain.nav}
              className={FOOTER_LINK_CLASS}
              color="foreground"
              showAnchorIcon={false}
              isRequireRedirect={false}
            >
              {FOOTER_NAV}
            </KunExternalLink>
            <Link href="/friend-link" className={FOOTER_LINK_CLASS}>
              {FOOTER_FRIEND}
            </Link>
            {kunMoyuMoe.domain.github_repo ? (
              <KunExternalLink
                link={kunMoyuMoe.domain.github_repo}
                className={FOOTER_LINK_CLASS}
                color="foreground"
                showAnchorIcon={false}
                isRequireRedirect={false}
              >
                {FOOTER_GITHUB}
              </KunExternalLink>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {kunMoyuMoe.domain.telegram_group ? (
              <KunExternalLink
                link={kunMoyuMoe.domain.telegram_group}
                className={FOOTER_LINK_CLASS}
                color="foreground"
                showAnchorIcon={false}
                isRequireRedirect={false}
              >
                Telegram
              </KunExternalLink>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
