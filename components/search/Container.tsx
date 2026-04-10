'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { FilterBar } from '~/components/galgame/FilterBar'
import { GalgameCard } from '~/components/galgame/Card'
import { KunHeader } from '~/components/kun/Header'
import { KunLoading } from '~/components/kun/Loading'
import { NsfwVisibilityHint } from '~/components/kun/NsfwVisibilityHint'
import { KunPagination } from '~/components/kun/Pagination'
import type { SortField, SortOrder } from '~/components/galgame/_sort'
import type { SearchResponse, SearchSuggestionType } from '~/types/api/search'
import { useSettingStore } from '~/store/settingStore'
import { useSearchStore } from '~/store/searchStore'
import { errorReporter, kunErrorHandler } from '~/utils/kunErrorHandler'
import { kunFetchPost } from '~/utils/kunFetch'
import { SearchHistory } from './SearchHistory'
import { SearchInput } from './Input'
import { SearchOption } from './Option'
import { SearchSuggestion } from './Suggestion'

const MAX_HISTORY_ITEMS = 10

export const SearchPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const latestSearchRequestIdRef = useRef(0)
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 500)
  const [hasSearched, setHasSearched] = useState(false)
  const [patches, setPatches] = useState<GalgameCard[]>([])
  const [hiddenCount, setHiddenCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<
    SearchSuggestionType[]
  >([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [sortField, setSortField] = useState<SortField>('resource_update_time')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showHistory, setShowHistory] = useState(false)

  const searchData = useSearchStore((state) => state.data)
  const setSearchData = useSearchStore((state) => state.setData)

  const settings = useSettingStore((state) => state.data)
  const isRestrictedContentEnabled =
    settings.kunNsfwEnable === 'nsfw' || settings.kunNsfwEnable === 'all'

  const addToHistory = (suggestions: SearchSuggestionType[]) => {
    if (suggestions.length === 0) {
      return
    }

    const entryKey = suggestions
      .map((item) => `${item.type}:${item.name}`)
      .sort()
      .join('|')

    const newHistory = [
      suggestions,
      ...searchData.searchHistory.filter((historyItem) => {
        const itemKey = historyItem
          .map((item) => `${item.type}:${item.name}`)
          .sort()
          .join('|')

        return itemKey !== entryKey
      })
    ].slice(0, MAX_HISTORY_ITEMS)

    setSearchData({ ...searchData, searchHistory: newHistory })
  }

  const handleSearch = async (currentPage = page) => {
    if (!selectedSuggestions.length) {
      return
    }

    const requestId = latestSearchRequestIdRef.current + 1
    latestSearchRequestIdRef.current = requestId

    setLoading(true)
    setShowHistory(false)
    setShowSuggestions(false)

    try {
      const response = await kunFetchPost<SearchResponse | string>('/search', {
        queryString: JSON.stringify(selectedSuggestions),
        limit: 12,
        searchOption: {
          searchInTitle: searchData.searchInTitle,
          searchInIntroduction: searchData.searchInIntroduction,
          searchInAlias: searchData.searchInAlias,
          searchInTag: searchData.searchInTag,
          searchInCompany: searchData.searchInCompany
        },
        page: currentPage,
        sortField,
        sortOrder
      })

      if (requestId !== latestSearchRequestIdRef.current) {
        return
      }

      if (typeof response === 'string') {
        kunErrorHandler(response, () => {})
        setPatches([])
        setTotal(0)
        setHiddenCount(0)
        setHasSearched(true)
        return
      }

      setPatches(Array.isArray(response.galgames) ? response.galgames : [])
      setTotal(typeof response.total === 'number' ? response.total : 0)
      setHiddenCount(
        typeof response.hiddenCount === 'number' ? response.hiddenCount : 0
      )
      setHasSearched(true)
      addToHistory(selectedSuggestions)
    } catch (error) {
      if (requestId !== latestSearchRequestIdRef.current) {
        return
      }

      setPatches([])
      setTotal(0)
      setHiddenCount(0)
      setHasSearched(true)
      errorReporter(error)
    } finally {
      if (requestId === latestSearchRequestIdRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    return () => {
      latestSearchRequestIdRef.current += 1
    }
  }, [])

  useEffect(() => {
    if (selectedSuggestions.length) {
      void handleSearch()
      return
    }

    latestSearchRequestIdRef.current += 1
    setPatches([])
    setHiddenCount(0)
    setHasSearched(false)
    setPage(1)
    setTotal(0)
    setLoading(false)
  }, [
    page,
    sortField,
    sortOrder,
    selectedSuggestions,
    searchData.searchInTitle,
    searchData.searchInIntroduction,
    searchData.searchInAlias,
    searchData.searchInTag,
    searchData.searchInCompany
  ])

  const showHiddenHint = hiddenCount > 0

  return (
    <div className="relative my-4 w-full space-y-6">
      <KunHeader
        name="搜索游戏"
        headerEndContent={<SearchOption />}
        endContent={
          <div className="text-default-500">
            <p>支持按游戏标题、详情正文、标签、会社名称进行单一或联合模糊搜索。</p>
            <p>如果想搜游戏介绍里的内容，请在搜索设置里开启“包含正文”。</p>
          </div>
        }
      />

      <SearchInput
        inputRef={inputRef}
        query={query}
        setQuery={setQuery}
        setShowSuggestions={setShowSuggestions}
        selectedSuggestions={selectedSuggestions}
        setSelectedSuggestions={setSelectedSuggestions}
        setShowHistory={setShowHistory}
      />

      {showSuggestions ? (
        <SearchSuggestion
          inputRef={inputRef}
          query={debouncedQuery}
          setQuery={setQuery}
          setSelectedSuggestions={setSelectedSuggestions}
        />
      ) : null}

      <SearchHistory
        showHistory={showHistory}
        setSelectedSuggestions={setSelectedSuggestions}
        setShowHistory={setShowHistory}
      />

      <FilterBar
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {loading ? (
        <KunLoading hint="正在搜索中..." />
      ) : (
        <div className="space-y-6">
          {patches.length > 0 ? (
            <>
              {showHiddenHint ? <NsfwVisibilityHint count={hiddenCount} /> : null}

              <div className="mx-auto mb-8 grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {patches.map((patch) => (
                  <GalgameCard key={patch.id} patch={patch} />
                ))}
              </div>
            </>
          ) : null}

          {total > 12 ? (
            <div className="flex justify-center">
              <KunPagination
                total={Math.ceil(total / 12)}
                page={page}
                onPageChange={setPage}
                isLoading={loading}
              />
            </div>
          ) : null}

          {hasSearched && patches.length === 0 ? (
            showHiddenHint ? (
              <div className="space-y-4">
                <NsfwVisibilityHint count={hiddenCount} />
                <div className="flex size-full flex-col items-center justify-center space-y-4">
                  <Image
                    className="rounded-2xl"
                    src="/null.webp"
                    alt="当前列表还有内容未显示"
                    width={150}
                    height={150}
                    priority
                  />
                  <div className="space-y-1 text-center">
                    <p>当前列表还有内容未显示</p>
                    <p>你可以先调整内容显示范围，再重新查看搜索结果。</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex size-full flex-col items-center justify-center space-y-4">
                <Image
                  className="rounded-2xl"
                  src="/null.webp"
                  alt="未找到相关内容"
                  width={150}
                  height={150}
                  priority
                />
                <div className="space-y-1 text-center">
                  <p>未找到相关内容</p>
                  <p>
                    {isRestrictedContentEnabled
                      ? '请尝试使用游戏的日文原名、标签或会社名称继续搜索。'
                      : '请尝试使用游戏的日文原名搜索，或在设置中调整内容显示范围。'}
                  </p>
                </div>
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  )
}
