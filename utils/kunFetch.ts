import { formatUnknownErrorMessage } from './formatErrorMessage'

type FetchOptions = {
  headers?: Record<string, string>
  query?: Record<string, string | number>
  body?: Record<string, unknown>
  formData?: FormData
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''
  }

  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV || ''
  }

  return (
    process.env.KUN_VISUAL_NOVEL_SITE_URL ||
    process.env.NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD ||
    ''
  )
}

const buildQueryString = (query?: Record<string, string | number>) => {
  if (!query) {
    return ''
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    params.set(key, String(value))
  }

  const output = params.toString()
  return output ? `?${output}` : ''
}

const parseErrorResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const json = await response.json()
    return formatUnknownErrorMessage(json)
  }

  const text = await response.text()
  return formatUnknownErrorMessage(text || `请求失败，状态码 ${response.status}`)
}

const kunFetchRequest = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  options?: FetchOptions
): Promise<T> => {
  try {
    const { headers = {}, query, body, formData } = options || {}
    const queryString = buildQueryString(query)
    const baseUrl = getBaseUrl()
    const fullUrl = `${baseUrl}/api${url}${queryString}`

    const fetchOptions: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        ...headers
      }
    }

    if (formData) {
      fetchOptions.body = formData
    } else if (body) {
      fetchOptions.body = JSON.stringify(body)
      fetchOptions.headers = {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    const response = await fetch(fullUrl, fetchOptions)

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response))
    }

    return response.json()
  } catch (error) {
    const message = formatUnknownErrorMessage(error)
    console.error(`Kun Fetch error: ${message}`)
    throw new Error(message)
  }
}

export const kunFetchGet = async <T>(
  url: string,
  query?: Record<string, string | number>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'GET', { query })
}

export const kunFetchPost = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'POST', { body })
}

export const kunFetchPut = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'PUT', { body })
}

export const kunFetchDelete = async <T>(
  url: string,
  query?: Record<string, string | number>
): Promise<T> => {
  return kunFetchRequest<T>(url, 'DELETE', { query })
}

export const kunFetchFormData = async <T>(
  url: string,
  formData?: FormData
): Promise<T> => {
  if (!formData) {
    throw new Error('提交表单时缺少必要数据')
  }

  return kunFetchRequest<T>(url, 'POST', { formData })
}
