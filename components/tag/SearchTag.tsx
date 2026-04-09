import { Input } from '@heroui/input'
import { Button } from '@heroui/react'
import { Search } from 'lucide-react'
import { KunLoading } from '~/components/kun/Loading'

interface SearchTagsProps {
  query: string
  setQuery: (value: string) => void
  handleSearch: () => void
  searching: boolean
}

export const SearchTags = ({
  query,
  setQuery,
  handleSearch,
  searching
}: SearchTagsProps) => {
  return (
    <>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="可用空格分隔多个关键词"
        endContent={
          <Button
            isIconOnly
            variant="light"
            aria-label="搜索标签"
            onPress={handleSearch}
          >
            <Search />
          </Button>
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearch()
        }}
      />
      {searching && <KunLoading hint="正在搜索标签数据..." />}
    </>
  )
}
