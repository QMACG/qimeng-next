import type { Metadata } from 'next'
import { ErrorComponent } from '~/components/error/ErrorComponent'
import { ResourceNoteSetting } from '~/components/admin/setting/ResourceNoteSetting'
import { kunGetResourceNoteConfigActions } from '../setting/actions'
import { kunMetadata } from './metadata'

export const revalidate = 3

export const metadata: Metadata = kunMetadata

export default async function AdminResourceNotePage() {
  const resourceNote = await kunGetResourceNoteConfigActions()

  if (typeof resourceNote === 'string') {
    return <ErrorComponent error={resourceNote} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">备注管理</h1>
      </div>

      <ResourceNoteSetting setting={resourceNote} />
    </div>
  )
}
