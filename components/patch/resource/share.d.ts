import type { Control, FieldErrors } from 'react-hook-form'

interface Fields {
  section: string
  patchId: number
  storage: string
  content: string
  note: string
  name: string
  hash: string
  size: string
  code: string
  password: string
  type: string[]
  language: string[]
  platform: string[]
}

export interface FileStatus {
  file: File
  progress: number
  error?: string
  hash?: string
  filetype?: string
}

export type ErrorType = FieldErrors<Fields>
export type ControlType = Control<any, any>
