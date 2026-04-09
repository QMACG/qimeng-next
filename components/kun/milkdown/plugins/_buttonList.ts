import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table2
} from 'lucide-react'
import {
  createCodeBlockCommand,
  insertHrCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
  wrapInHeadingCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand
} from '@milkdown/preset-commonmark'
import { insertTableCommand, toggleStrikethroughCommand } from '@milkdown/preset-gfm'
import type { CmdKey } from '@milkdown/core'

export const createButtons = (
  call: <T>(command: CmdKey<T>, payload?: T | undefined) => boolean | undefined
) => [
  {
    tooltip: '加粗文本',
    icon: Bold,
    onPress: () => call(toggleStrongCommand.key),
    ariaLabel: '加粗文本'
  },
  {
    tooltip: '斜体',
    icon: Italic,
    onPress: () => call(toggleEmphasisCommand.key),
    ariaLabel: '斜体'
  },
  {
    tooltip: '删除线',
    icon: Strikethrough,
    onPress: () => call(toggleStrikethroughCommand.key),
    ariaLabel: '删除线'
  },
  {
    tooltip: '一级标题',
    icon: Heading1,
    onPress: () => call(wrapInHeadingCommand.key, 1),
    ariaLabel: '一级标题'
  },
  {
    tooltip: '二级标题',
    icon: Heading2,
    onPress: () => call(wrapInHeadingCommand.key, 2),
    ariaLabel: '二级标题'
  },
  {
    tooltip: '三级标题',
    icon: Heading3,
    onPress: () => call(wrapInHeadingCommand.key, 3),
    ariaLabel: '三级标题'
  },
  {
    tooltip: '无序列表',
    icon: List,
    onPress: () => call(wrapInBulletListCommand.key),
    ariaLabel: '无序列表'
  },
  {
    tooltip: '有序列表',
    icon: ListOrdered,
    onPress: () => call(wrapInOrderedListCommand.key),
    ariaLabel: '有序列表'
  },
  {
    tooltip: '引用文本',
    icon: Quote,
    onPress: () => call(wrapInBlockquoteCommand.key),
    ariaLabel: '引用文本'
  },
  {
    tooltip: '水平分割线',
    icon: Minus,
    onPress: () => call(insertHrCommand.key),
    ariaLabel: '水平分割线'
  },
  {
    tooltip: '代码块',
    icon: Code2,
    onPress: () => call(createCodeBlockCommand.key, 'javascript'),
    ariaLabel: '代码块'
  },
  {
    tooltip: '插入表格',
    icon: Table2,
    onPress: () => call(insertTableCommand.key, { row: 3, col: 3 }),
    ariaLabel: '插入表格'
  },
  {
    tooltip: '行内代码',
    icon: Code,
    onPress: () => call(toggleInlineCodeCommand.key),
    ariaLabel: '行内代码'
  }
]
