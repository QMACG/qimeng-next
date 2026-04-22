export const toDatetimeLocalValue = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export const toIsoString = (value: string) => {
  if (!value) {
    return new Date().toISOString()
  }

  return new Date(value).toISOString()
}
