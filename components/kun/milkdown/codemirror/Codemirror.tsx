import { EditorSelection } from '@codemirror/state'
import type { FC } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { createCodeMirrorState, createCodeMirrorView } from './setup'

interface InsertCalloutPayload {
  type: string
  title?: string
  content?: string
}

export interface CodemirrorAPI {
  update: (markdown: string) => void
  surroundSelection: (
    prefix: string,
    suffix?: string,
    placeholder?: string
  ) => void
  toggleHeading: (level: 1 | 2 | 3) => void
  toggleBulletList: () => void
  toggleOrderedList: () => void
  toggleBlockquote: () => void
  insertHorizontalRule: () => void
  insertCodeBlock: (language?: string) => void
  insertTable: (columnCount?: number) => void
  insertTableTemplate: (template: string) => void
  insertLink: (text: string, href: string) => void
  insertImage: (alt: string, src: string, title?: string) => void
  insertGallery: (rawLinks?: string) => void
  insertButton: (text: string, href: string, type?: string) => void
  insertCallout: (payload: InsertCalloutPayload) => void
  insertVideo: (src: string) => void
}

export interface CodemirrorProps {
  markdown: string
  setCmAPI: (api: CodemirrorAPI) => void
  onChange: (getString: () => string) => void
  placeholder?: string
}

const buildGalleryTemplate = (rawLinks = '') => {
  const links = rawLinks
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)

  const images =
    links.length > 0
      ? links
          .map((link, index) => `![画廊图片 ${index + 1}](${link})`)
          .join('\n\n')
      : ['![画廊图片 1](https://example.com/1.avif)', '![画廊图片 2](https://example.com/2.avif)', '![画廊图片 3](https://example.com/3.avif)'].join('\n\n')

  return `\n:::gallery\n${images}\n:::\n`
}

const buildCalloutTemplate = ({
  type,
  title,
  content
}: InsertCalloutPayload) => {
  const normalizedType = type.trim() || 'info'
  const normalizedTitle = title?.trim().replace(/"/g, "'")
  const normalizedContent = content?.trim() || '这里填写提示内容。'
  const titleAttr = normalizedTitle ? ` title="${normalizedTitle}"` : ''

  return `\n:::callout{type="${normalizedType}"${titleAttr}}\n${normalizedContent}\n:::\n`
}

export const Codemirror: FC<CodemirrorProps> = ({
  markdown,
  setCmAPI,
  onChange,
  placeholder
}) => {
  const divRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ReturnType<typeof createCodeMirrorView>>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const emitChange = useCallback((getString: () => string) => {
    onChangeRef.current(getString)
  }, [])

  const updateMarkdown = (nextMarkdown: string) => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    const state = createCodeMirrorState({
      onChange: emitChange,
      content: nextMarkdown,
      placeholder
    })
    editor.setState(state)
  }

  const replaceSelection = (
    prefix: string,
    suffix = prefix,
    placeholderText = '文本'
  ) => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    const { state } = editor
    const selection = state.selection.main
    const selectedText = state.doc.sliceString(selection.from, selection.to)
    const content = selectedText || placeholderText
    const insert = `${prefix}${content}${suffix}`
    const anchor = selection.from + prefix.length
    const head = anchor + content.length

    editor.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert
      },
      selection: { anchor, head }
    })
    editor.focus()
  }

  const replaceSelectedLines = (
    mapper: (lineText: string, index: number) => string
  ) => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    const { state } = editor
    const selection = state.selection.main
    const startLine = state.doc.lineAt(selection.from)
    const endLine = state.doc.lineAt(selection.to)
    const lines: string[] = []

    for (
      let lineNumber = startLine.number;
      lineNumber <= endLine.number;
      lineNumber += 1
    ) {
      lines.push(state.doc.line(lineNumber).text)
    }

    const nextContent = lines.map(mapper).join('\n')

    editor.dispatch({
      changes: {
        from: startLine.from,
        to: endLine.to,
        insert: nextContent
      },
      selection: EditorSelection.range(
        startLine.from,
        startLine.from + nextContent.length
      )
    })
    editor.focus()
  }

  const toggleLinePrefix = (prefixResolver: (index: number) => string) => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    const { state } = editor
    const selection = state.selection.main
    const startLine = state.doc.lineAt(selection.from)
    const endLine = state.doc.lineAt(selection.to)
    const lines = []

    for (
      let lineNumber = startLine.number;
      lineNumber <= endLine.number;
      lineNumber += 1
    ) {
      lines.push(state.doc.line(lineNumber))
    }

    const removePrefix = lines.every((line, index) =>
      line.text.startsWith(prefixResolver(index))
    )

    const changes = lines.flatMap((line, index) => {
      const prefix = prefixResolver(index)

      if (removePrefix && line.text.startsWith(prefix)) {
        return {
          from: line.from,
          to: line.from + prefix.length,
          insert: ''
        }
      }

      if (!removePrefix) {
        return {
          from: line.from,
          insert: prefix
        }
      }

      return []
    })

    if (!changes.length) {
      return
    }

    const totalDelta = changes.reduce((sum, change) => {
      const removed =
        'to' in change && typeof change.to === 'number'
          ? change.to - change.from
          : 0

      return sum + String(change.insert ?? '').length - removed
    }, 0)

    editor.dispatch({
      changes,
      selection: EditorSelection.range(
        selection.from,
        Math.max(selection.from, selection.to + totalDelta)
      )
    })
    editor.focus()
  }

  const insertText = (text: string, selectOffset?: [number, number]) => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    const { state } = editor
    const selection = state.selection.main
    const nextSelection = selectOffset
      ? {
          anchor: selection.from + selectOffset[0],
          head: selection.from + selectOffset[1]
        }
      : {
          anchor: selection.from + text.length,
          head: selection.from + text.length
        }

    editor.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: text
      },
      selection: nextSelection
    })
    editor.focus()
  }

  useLayoutEffect(() => {
    if (!divRef.current) {
      return
    }

    const editor = createCodeMirrorView({
      root: divRef.current,
      onChange: emitChange,
      content: markdown,
      placeholder
    })
    editorRef.current = editor

    setCmAPI({
      update: updateMarkdown,
      surroundSelection: replaceSelection,
      toggleHeading: (level) => {
        const headingPrefix = `${'#'.repeat(level)} `
        replaceSelectedLines((lineText) => {
          const normalizedText = lineText.replace(/^#{1,6}\s+/, '').trim()

          if (lineText.startsWith(headingPrefix)) {
            return normalizedText
          }

          return `${headingPrefix}${normalizedText || '标题'}`
        })
      },
      toggleBulletList: () => toggleLinePrefix(() => '- '),
      toggleOrderedList: () => toggleLinePrefix((index) => `${index + 1}. `),
      toggleBlockquote: () => toggleLinePrefix(() => '> '),
      insertHorizontalRule: () => insertText('\n\n-----\n\n'),
      insertCodeBlock: (language = '') => {
        const selection = editor.state.selection.main
        const selectedText = editor.state.doc.sliceString(
          selection.from,
          selection.to
        )
        const content = selectedText || '\n'
        const insert = `\n\`\`\`${language}\n${content}\n\`\`\`\n`
        const cursorStart = selection.from + 4 + language.length
        const cursorEnd = cursorStart + content.length

        insertText(insert, [cursorStart, cursorEnd])
      },
      insertTable: (columnCount = 3) => {
        const header = Array.from(
          { length: columnCount },
          (_, index) => `列 ${index + 1}`
        )
        const body = Array.from(
          { length: columnCount },
          (_, index) => `内容 ${index + 1}`
        )
        const insert =
          `| ${header.join(' | ')} |\n` +
          `| ${Array.from({ length: columnCount }, () => '---').join(' | ')} |\n` +
          `| ${body.join(' | ')} |`

        insertText(insert)
      },
      insertTableTemplate: (template) => {
        insertText(`\n${template}\n`)
      },
      insertLink: (text, href) => {
        const linkText = text.trim() || '链接文本'
        const linkHref = href.trim() || 'https://example.com'
        const insert = `[${linkText}](${linkHref})`
        insertText(insert, [1, 1 + linkText.length])
      },
      insertImage: (alt, src, title) => {
        const imageAlt = alt.trim() || '图片描述'
        const imageSrc = src.trim() || 'https://example.com/image.jpg'
        const imageTitle = title?.trim() ?? ''
        const insert = imageTitle
          ? `![${imageAlt}](${imageSrc} "${imageTitle}")`
          : `![${imageAlt}](${imageSrc})`

        insertText(insert, [2, 2 + imageAlt.length])
      },
      insertGallery: (rawLinks = '') => {
        const insert = buildGalleryTemplate(rawLinks)
        const firstImageIndex = insert.indexOf('![')
        insertText(
          insert,
          firstImageIndex >= 0
            ? [firstImageIndex, insert.length - 5]
            : undefined
        )
      },
      insertButton: (text, href, type = 'primary') => {
        const buttonText = text.trim() || '立即前往'
        const buttonHref = href.trim() || 'https://example.com'
        const buttonType = type.trim() || 'primary'
        const insert = `\n{button href="${buttonHref}" type="${buttonType}"}${buttonText}{/button}\n`
        const start = insert.indexOf(buttonText)

        insertText(insert, [start, start + buttonText.length])
      },
      insertCallout: (payload) => {
        const insert = buildCalloutTemplate(payload)
        const content = payload.content?.trim() || '这里填写提示内容。'
        const start = insert.indexOf(content)

        insertText(insert, [start, start + content.length])
      },
      insertVideo: (src: string) => {
        const insert = `{{kun-video="${src.trim()}"}}`
        insertText(insert)
      }
    })

    return () => {
      editor.destroy()
    }
  }, [emitChange, placeholder, setCmAPI])

  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.state.doc.toString() !== markdown
    ) {
      updateMarkdown(markdown)
    }
  }, [markdown, emitChange, placeholder])

  return (
    <div
      className="flex-1"
      ref={divRef}
      onClick={() => {
        editorRef.current?.focus()
      }}
    />
  )
}
