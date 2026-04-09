export const splitResourceLinks = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)

export const syncResourceNames = (names: string[], count: number) =>
  Array.from({ length: count }, (_, index) => names[index] ?? '')

export const getDefaultResourceTitle = (section: string, index: number) => {
  if (section === 'direct') {
    return `直链资源 ${index + 1}`
  }

  return `资源 ${index + 1}`
}
