import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc'
import { KunLink } from './element/KunLink'
import { KunTable } from './element/KunTable'
import { KunCode } from './element/KunCode'
import { createKunHeading } from './element/kunHeading'
import { MarkdownButtonLink } from '~/components/kun/markdown/MarkdownButtonLink'
import { MarkdownCallout } from '~/components/kun/markdown/MarkdownCallout'
import { MarkdownGallery } from '~/components/kun/markdown/MarkdownGallery'
import { transformMarkdownEnhancementsToMdx } from '~/utils/markdown/customButtonSyntax'
import '~/components/patch/introduction/_adjust.scss'

const components = {
  h1: createKunHeading(1),
  h2: createKunHeading(2),
  h3: createKunHeading(3),
  h4: createKunHeading(4),
  h5: createKunHeading(5),
  h6: createKunHeading(6),
  a: KunLink,
  code: KunCode,
  Table: KunTable,
  MarkdownButtonLink,
  MarkdownCallout,
  MarkdownGallery
}

export const CustomMDX = (props: MDXRemoteProps) => {
  return (
    <MDXRemote
      {...props}
      source={
        typeof props.source === 'string'
          ? transformMarkdownEnhancementsToMdx(props.source)
          : props.source
      }
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
