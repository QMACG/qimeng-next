'use client'

import { useCallback, useState } from 'react'
import type { CSSProperties } from 'react'
import { Codemirror } from './codemirror/Codemirror'
import { MarkdownToolbar } from './codemirror/MarkdownToolbar'
import type { CodemirrorAPI } from './codemirror/Codemirror'

interface KunEditorProps {
  valueMarkdown: string
  saveMarkdown: (markdown: string) => void
  disableUserKey?: boolean
  placeholder?: string
  minHeight?: string
}

export const KunEditor = ({
  valueMarkdown,
  saveMarkdown,
  placeholder,
  minHeight
}: KunEditorProps) => {
  const [api, setApi] = useState<CodemirrorAPI | null>(null)
  const handleChange = useCallback(
    (getString: () => string) => {
      saveMarkdown(getString())
    },
    [saveMarkdown]
  )

  return (
    <div
      className="w-full min-h-64"
      style={
        minHeight
          ? ({
              ['--kun-editor-min-height' as string]: minHeight
            } as CSSProperties)
          : undefined
      }
      onClick={(event) => event.stopPropagation()}
    >
      <MarkdownToolbar api={api} />

      <div className="mt-3 overflow-hidden rounded-xl border border-default-200 bg-content1/40">
        <Codemirror
          markdown={valueMarkdown}
          setCmAPI={setApi}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
