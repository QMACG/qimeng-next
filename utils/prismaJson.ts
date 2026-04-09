import { Prisma } from '~/prisma/generated/prisma/client'

export const toJsonStringArray = (value: string[]): Prisma.JsonArray => {
  return [...value] as Prisma.JsonArray
}

export const parseJsonStringArray = (
  value: Prisma.JsonValue | null | undefined
): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}
