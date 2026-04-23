const prettifyDirectorySegment = (segment: string) =>
  decodeURIComponent(segment).replace(/[-_]+/g, ' ').trim()

export const getDocDirectoryLabel = (path: string, directoryLabel?: string) => {
  const pathSegments = path.split('/').filter(Boolean)
  const labelSegments = (directoryLabel ?? '')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)

  const index = pathSegments.length - 1
  const label = labelSegments[index]
  if (label) {
    return label
  }

  const target = pathSegments.at(-1) ?? path
  return prettifyDirectorySegment(target) || 'article'
}

export const getDocDirectoryLabelSegments = (
  path: string,
  directoryLabel?: string
) => {
  const pathSegments = path.split('/').filter(Boolean)
  const labelSegments = (directoryLabel ?? '')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)

  return pathSegments.map(
    (segment, index) =>
      labelSegments[index] || prettifyDirectorySegment(segment)
  )
}
