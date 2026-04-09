import type { FC, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export const MarkdownGallery: FC<Props> = ({ children }) => {
  return (
    <div className="data-kun-gallery grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      {children}
    </div>
  )
}
