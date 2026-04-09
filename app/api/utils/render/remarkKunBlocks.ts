import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Node } from 'unist'

export const remarkKunBlocks: Plugin<[], Node> = () => {
  return (tree) => {
    visit(tree, (node: any) => {
      if (node.type !== 'containerDirective') {
        return
      }

      if (node.name === 'callout') {
        const attributes = node.attributes ?? {}
        const type = (attributes.type ?? 'info').toString().trim() || 'info'
        const title = (attributes.title ?? '').toString().trim()
        const data = node.data || (node.data = {})

        data.hName = 'div'
        data.hProperties = {
          className: ['data-kun-callout', `data-kun-callout-${type}`],
          'data-kun-callout': '',
          'data-kun-callout-type': type,
          ...(title ? { 'data-title': title } : {})
        }
      }

      if (node.name === 'gallery') {
        const data = node.data || (node.data = {})
        data.hName = 'div'
        data.hProperties = {
          className: ['data-kun-gallery'],
          'data-kun-gallery': ''
        }
      }
    })
  }
}
