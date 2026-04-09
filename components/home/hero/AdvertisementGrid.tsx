import type { HomeBoxAdvertisement } from '~/types/api/advertisement'

interface Props {
  advertisements: HomeBoxAdvertisement[]
}

const getGridClassName = (count: number) => {
  switch (count) {
    case 1:
      return 'grid-cols-1 grid-rows-1'
    case 2:
      return 'grid-cols-1 grid-rows-2'
    case 3:
      return 'grid-cols-1 grid-rows-3'
    default:
      return 'grid-cols-2 grid-rows-2'
  }
}

export const HomeAdvertisementGrid = ({ advertisements }: Props) => {
  if (!advertisements.length) {
    return null
  }

  const visibleAdvertisements = advertisements.slice(0, 4)

  return (
    <div
      className={`grid h-[200px] gap-3 sm:h-[300px] ${getGridClassName(
        visibleAdvertisements.length
      )}`}
    >
      {visibleAdvertisements.map((advertisement) => (
        <a
          key={advertisement.id}
          href={advertisement.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative h-full min-h-0 overflow-hidden rounded-[1.35rem] border border-divider bg-content1 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="relative h-full min-h-0 overflow-hidden">
            <img
              src={advertisement.banner}
              alt="首页广告"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/8 to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>
        </a>
      ))}
    </div>
  )
}
