import { ReactNode } from 'react'
import { KunSidebar } from '~/components/doc/Sidebar'
import { getDirectoryTree } from '~/lib/mdx/directoryTree'

interface LayoutProps {
  children: ReactNode
}

export default async function Layout({ children }: LayoutProps) {
  const tree = await getDirectoryTree()

  return (
    <div className="container mx-auto my-4 flex">
      <KunSidebar tree={tree} />
      <main className="flex-1 overflow-y-auto pl-0 md:pl-64">{children}</main>
    </div>
  )
}
