import {
  getDocDirectoryLabel,
  getDocDirectoryLabelSegments
} from '~/constants/doc'
import { getAllPosts } from './getPosts'
import type { KunTreeNode } from './types'

export const getDirectoryTree = async (): Promise<KunTreeNode> => {
  const posts = await getAllPosts()
  const root: KunTreeNode = {
    name: 'doc',
    label: '文章',
    path: '',
    children: [],
    type: 'directory'
  }

  for (const post of posts) {
    const segments = post.slug.split('/').filter(Boolean)
    const directoryPath = segments.slice(0, -1).join('/')
    const directoryLabelSegments = getDocDirectoryLabelSegments(
      directoryPath,
      post.directoryLabel
    )
    const fileName = segments.pop()

    if (!fileName) {
      continue
    }

    let current = root
    const currentPath: string[] = []

    for (const segment of segments) {
      currentPath.push(segment)
      const directoryPath = currentPath.join('/')
      const label = directoryLabelSegments[currentPath.length - 1]
      const existingNode = current.children?.find(
        (child) => child.type === 'directory' && child.path === directoryPath
      )

      if (existingNode) {
        current = existingNode
        continue
      }

      const newNode: KunTreeNode = {
        name: segment,
        label: label || getDocDirectoryLabel(directoryPath),
        path: directoryPath,
        children: [],
        type: 'directory'
      }

      current.children = [...(current.children ?? []), newNode]
      current = newNode
    }

    current.children = [
      ...(current.children ?? []),
      {
        name: fileName,
        label: post.title,
        path: post.slug,
        type: 'file'
      }
    ]
  }

  const sortTree = (node: KunTreeNode): KunTreeNode => {
    if (!node.children?.length) {
      return node
    }

    node.children = node.children
      .map(sortTree)
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1
        }

        return a.label.localeCompare(b.label, 'zh-CN')
      })

    return node
  }

  return sortTree(root)
}
