import { getAllPosts } from '~/lib/mdx/getPosts'
import { KunAboutHeader } from '~/components/doc/Header'
import { KunAboutCard } from '~/components/doc/Card'
import { KunMasonryGrid } from '~/components/kun/MasonryGrid'
import { kunMetadata } from './metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = kunMetadata

export default async function Kun() {
  const posts = await getAllPosts()

  return (
    <div className="w-full px-6 pb-6">
      <KunAboutHeader />

      <div className="grid gap-4">
        <KunMasonryGrid columnWidth={256} gap={24}>
          {posts.map((post) => (
            <KunAboutCard key={post.slug} post={post} />
          ))}
        </KunMasonryGrid>
      </div>
    </div>
  )
}
