import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypePrism from 'rehype-prism-plus'
import { unified } from 'unified'
import { remarkKunExternalLinks } from './remarkKunExternalLinks'
import { remarkKunBlocks } from './remarkKunBlocks'
import { transformButtonSyntaxToHtml } from '~/utils/markdown/customButtonSyntax'

export const markdownToHtml = async (markdown: string) => {
  const normalizedMarkdown = transformButtonSyntaxToHtml(markdown)

  const htmlVFile = await unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkKunBlocks)
    .use(remarkRehype)
    .use(remarkKunExternalLinks)
    .use(rehypeSanitize, {
      attributes: {
        a: [
          'data-kun-external-link',
          'data-href',
          'data-text',
          'href',
          'target',
          'rel',
          'className'
        ],
        div: [
          'data-kun-button',
          'data-kun-callout',
          'data-kun-callout-type',
          'data-kun-gallery',
          'data-href',
          'data-type',
          'data-text',
          'data-title',
          'className'
        ],
        img: ['src', 'alt', 'title', 'class', 'loading']
      }
    })
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(rehypePrism, { ignoreMissing: true })
    .use(rehypeStringify)
    .process(normalizedMarkdown)

  return String(htmlVFile)
}
