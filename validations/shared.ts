import { z } from 'zod'

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isValidRootPath = (value: string) => /^\/(?!\/)/.test(value)

export const createHttpUrlOrPathSchema = (message: string) =>
  z
    .string()
    .trim()
    .min(1, { message: '请完整填写必填项' })
    .refine((value) => isValidHttpUrl(value) || isValidRootPath(value), {
      message
    })
