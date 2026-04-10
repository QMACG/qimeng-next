import Image from 'next/image'
import Link from 'next/link'
import { KunExternalLink } from './external-link/ExternalLink'

const FOOTER_COPYRIGHT = '© 2026 '
const FOOTER_DOC = '文档'
const FOOTER_NAV = '导航'
const FOOTER_FRIEND = '友情链接'
const FOOTER_GITHUB = 'GitHub 仓库'
const FOOTER_LINK_CLASS =
  'flex items-center text-sm font-medium leading-none text-default-700 no-underline transition-colors hover:text-foreground'

interface Props {
  titleShort: string
  navLink: string
  githubRepo?: string
  telegramGroup?: string
}

export const KunFooter = ({
  titleShort,
  navLink,
  githubRepo,
  telegramGroup
}: Props) => {
  return (
    <footer className="mt-8 w-full border-t border-divider text-sm">
      <div className="mx-auto max-w-7xl px-2 sm:px-6">
        <div className="flex flex-wrap justify-center gap-4 py-6 md:justify-between">
          <Link href="/" className={FOOTER_LINK_CLASS}>
            <Image src="/favicon.ico" alt={titleShort} width={30} height={30} />
            <span className="ml-2">
              {FOOTER_COPYRIGHT}
              {titleShort}
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/doc" className={FOOTER_LINK_CLASS}>
              {FOOTER_DOC}
            </Link>
            <KunExternalLink
              link={navLink}
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
            {githubRepo ? (
              <KunExternalLink
                link={githubRepo}
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
            {telegramGroup ? (
              <KunExternalLink
                link={telegramGroup}
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
