import toast from 'react-hot-toast'
import { formatUnknownErrorMessage } from './formatErrorMessage'

export const kunErrorHandler = <T>(
  res: T | string,
  callback: (res: T) => void
) => {
  if (typeof res === 'string') {
    toast.error(formatUnknownErrorMessage(res))
  } else {
    callback(res)
  }
}

export const kunErrorHandlerAsync = <T>(res: T | string): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    if (typeof res === 'string') {
      const message = formatUnknownErrorMessage(res)
      toast.error(message)
      reject(new Error(message))
    } else {
      resolve(res)
    }
  })
}

export const errorReporter = (error: unknown) => {
  toast.error(formatUnknownErrorMessage(error))
}
