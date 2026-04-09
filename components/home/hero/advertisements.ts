import { getAdvertisementModel } from '~/utils/prisma/advertisement'
import type { HomeBoxAdvertisement } from '~/types/api/advertisement'

interface ViewerContext {
  uid?: number
}

export const getHomeBoxAdvertisements = async (
  viewer: ViewerContext = {}
): Promise<HomeBoxAdvertisement[]> => {
  const advertisementModel = getAdvertisementModel()
  if (!advertisementModel) {
    console.warn(
      '[advertisement] Prisma Client 尚未包含 site_advertisement 模型，首页广告将暂时按无广告处理。'
    )
    return []
  }

  const advertisements = await advertisementModel.findMany({
    where: {
      kind: 'home_box'
    },
    orderBy: [{ slot: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      banner: true,
      link: true,
      slot: true,
      visible_for_guest: true
    }
  })

  return advertisements
    .filter((item) => (viewer.uid ? true : item.visible_for_guest))
    .filter((item): item is typeof item & { slot: number } => item.slot !== null)
    .map((item) => ({
      id: item.id,
      banner: item.banner,
      link: item.link,
      slot: item.slot
    }))
}
