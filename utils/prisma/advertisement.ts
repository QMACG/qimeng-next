import { prisma } from '~/prisma/index'

type AdvertisementPrisma = typeof prisma & {
  site_advertisement?: {
    findMany: (...args: any[]) => Promise<any[]>
    findFirst: (...args: any[]) => Promise<any>
  }
}

export const getAdvertisementModel = () => {
  const model = (prisma as AdvertisementPrisma).site_advertisement
  if (!model || typeof model.findMany !== 'function') {
    return null
  }

  return model
}
