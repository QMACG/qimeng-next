import { NextRequest, NextResponse } from 'next/server'
import { kunParseFormData, kunParsePutBody } from '~/app/api/utils/parseQuery'
import { verifyHeaderCookie } from '~/middleware/_verifyHeaderCookie'
import { normalizeStringArray } from '~/utils/normalizeStringArray'
import { patchCreateSchema, patchUpdateSchema } from '~/validations/edit'
import { createGalgame } from './create'
import { updateGalgame } from './update'

const INVALID_TAG_FORMAT = '标签格式不正确'
const TAG_LIMIT_EXCEEDED = '标签最多只能提交 100 项'
const TAG_TOO_LONG = '单个标签长度不能超过 500 个字符'
const USER_NOT_LOGGED_IN = '用户未登录'
const CREATE_PERMISSION_DENIED = '仅编辑及以上角色可以发布游戏'
const UPDATE_PERMISSION_DENIED = '仅编辑及以上角色可以编辑游戏'

const checkTagArrayValid = (arrayString: string) => {
  let parsedArray: unknown

  try {
    parsedArray = JSON.parse(arrayString)
  } catch {
    return INVALID_TAG_FORMAT
  }

  if (!Array.isArray(parsedArray)) {
    return INVALID_TAG_FORMAT
  }

  const normalizedArray = normalizeStringArray(parsedArray)

  if (normalizedArray.length > 100) {
    return TAG_LIMIT_EXCEEDED
  }

  const maxLengthExceeded = normalizedArray.some((item) => item.length > 500)
  if (maxLengthExceeded) {
    return TAG_TOO_LONG
  }

  return normalizedArray
}

export const POST = async (req: NextRequest) => {
  const input = await kunParseFormData(req, patchCreateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json(USER_NOT_LOGGED_IN)
  }
  if (payload.role < 2) {
    return NextResponse.json(CREATE_PERMISSION_DENIED)
  }

  const { tag, ...rest } = input
  const tagResult = checkTagArrayValid(tag)
  if (typeof tagResult === 'string') {
    return NextResponse.json(tagResult)
  }

  const response = await createGalgame(
    {
      tag: tagResult,
      ...rest
    },
    payload.uid
  )

  return NextResponse.json(response)
}

export const PUT = async (req: NextRequest) => {
  const input = await kunParsePutBody(req, patchUpdateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json(USER_NOT_LOGGED_IN)
  }
  if (payload.role < 2) {
    return NextResponse.json(UPDATE_PERMISSION_DENIED)
  }

  const response = await updateGalgame(input, payload.uid)
  return NextResponse.json(response)
}
