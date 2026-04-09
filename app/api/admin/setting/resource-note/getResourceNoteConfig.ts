import { prisma } from '~/prisma/index'
import type { AdminResourceNoteConfig } from '~/types/api/admin'

const DEFAULT_RESOURCE_NOTE_CONFIG: AdminResourceNoteConfig = {
  enableNote: true,
  defaultNote: ''
}

export const getResourceNoteConfig = async () => {
  const config = await prisma.site_resource_note_config.findUnique({
    where: { id: 1 }
  })

  if (!config) {
    const created = await prisma.site_resource_note_config.create({
      data: {
        id: 1,
        enable_note: DEFAULT_RESOURCE_NOTE_CONFIG.enableNote,
        default_note: DEFAULT_RESOURCE_NOTE_CONFIG.defaultNote
      }
    })

    return {
      enableNote: created.enable_note,
      defaultNote: created.default_note
    }
  }

  return {
    enableNote: config.enable_note,
    defaultNote: config.default_note
  }
}
