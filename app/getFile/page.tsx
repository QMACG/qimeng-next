import type { Metadata } from 'next'
import { GetFileContainer } from '~/components/get-file/Container'
import { metadata as pageMetadata } from './metadata'
import { verifyHeaderCookie } from '~/utils/actions/verifyHeaderCookie'
import { getNSFWHeader } from '~/utils/actions/getNSFWHeader'
import { createDirectDownloadPreview } from '~/app/api/direct-download/_shared'

export const metadata: Metadata = pageMetadata

interface Props {
  searchParams?: Promise<{
    file?: string
  }>
}

export default async function GetFilePage({ searchParams }: Props) {
  const [resolvedSearchParams, payload, nsfwHeader] = await Promise.all([
    searchParams,
    verifyHeaderCookie(),
    getNSFWHeader()
  ])

  const preview = await createDirectDownloadPreview(
    resolvedSearchParams?.file ?? '',
    {
      uid: payload?.uid ?? 0,
      role: payload?.role ?? 0,
      nsfwPreference: nsfwHeader.content_limit ?? 'all'
    }
  )

  return <GetFileContainer preview={preview} />
}
