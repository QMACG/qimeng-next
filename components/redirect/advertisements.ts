import { getAdvertisementModel } from '~/utils/prisma/advertisement'
import type { RedirectBoxAdvertisement } from '~/types/api/advertisement'

interface ViewerContext {
  uid?: number
}

export const getRedirectBoxAdvertisement = async (
  viewer: ViewerContext = {}
): Promise<RedirectBoxAdvertisement | null> => {
  const advertisementModel = getAdvertisementModel()
  if (
    !advertisementModel ||
    typeof advertisementModel.findFirst !== 'function'
  ) {
    console.warn(
      '[advertisement] Prisma Client 尚未包含 site_advertisement 模型，跳转页将暂时按无广告处理。'
    )
    return null
  }

  const advertisement = await advertisementModel.findFirst({
    where: {
      kind: 'redirect_box',
      ...(viewer.uid ? {} : { visible_for_guest: true })
    },
    orderBy: [{ sort_order: 'desc' }, { id: 'asc' }],
    select: {
      id: true,
      banner: true,
      link: true
    }
  })

  if (!advertisement) {
    return null
  }

  return {
    id: advertisement.id,
    banner: advertisement.banner,
    link: advertisement.link
  }
}
