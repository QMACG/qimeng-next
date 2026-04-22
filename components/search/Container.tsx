'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { FilterBar } from '~/components/galgame/FilterBar'
import { GalgameCard } from '~/components/galgame/Card'
import { KunHeader } from '~/components/kun/Header'
import { KunLoading } from '~/components/kun/Loading'
import { NsfwVisibilityHint } from '~/components/kun/NsfwVisibilityHint'
import { KunPagination } from '~/components/kun/Pagination'
import type { SortField, SortOrder } from '~/components/galgame/_sort'
import type { SearchResponse, SearchSuggestionType } from '~/types/api/search'
import { useSearchStore } from '~/store/searchStore'
import { errorReporter, kunErrorHandler } from '~/utils/kunErrorHandler'
import { kunFetchPost } from '~/utils/kunFetch'
import { SearchHistory } from './SearchHistory'
import { SearchInput } from './Input'
import { SearchOption } from './Option'
import { SearchSuggestion } from './Suggestion'
import type { SetStateAction } from 'react'

const MAX_HISTORY_ITEMS = 10
const DEFAULT_SORT_FIELD: SortField = 'created'
const DEFAULT_SORT_ORDER: SortOrder = 'desc'

const SEARCH_SORT_FIELDS: SortField[] = [
  'created',
  'resource_update_time',
  'view',
  'download',
  'favorite',
  'rating'
]

const QUERY_PARAM_KEYS = {
  query: 'q',
  keyword: 'k',
  tag: 't',
  page: 'p',
  sortField: 'sf',
  sortOrder: 'so'
} as const

type SearchParamsLike = {
  get: (name: string) => string | null
  getAll: (name: string) => string[]
}

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseSelectedSuggestions = (
  value: string | null
): SearchSuggestionType[] => {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value) as SearchSuggestionType[]
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item): item is SearchSuggestionType =>
      Boolean(
        item &&
          typeof item === 'object' &&
          (item.type === 'keyword' || item.type === 'tag') &&
          typeof item.name === 'string' &&
          item.name.trim()
      )
    )
  } catch {
    return []
  }
}

const appendSuggestion = (
  suggestions: SearchSuggestionType[],
  seen: Set<string>,
  type: SearchSuggestionType['type'],
  rawName: string
) => {
  const name = rawName.trim()
  if (!name) {
    return
  }

  const key = `${type}:${name}`
  if (seen.has(key)) {
    return
  }

  seen.add(key)
  suggestions.push({ type, name })
}

const parseSuggestionsFromParams = (params: SearchParamsLike) => {
  const suggestions: SearchSuggestionType[] = []
  const seen = new Set<string>()

  params.getAll(QUERY_PARAM_KEYS.keyword).forEach((name: string) => {
    appendSuggestion(suggestions, seen, 'keyword', name)
  })
  params.getAll(QUERY_PARAM_KEYS.tag).forEach((name: string) => {
    appendSuggestion(suggestions, seen, 'tag', name)
  })

  if (suggestions.length > 0) {
    return suggestions
  }

  return parseSelectedSuggestions(params.get('selected'))
}

const readSearchParam = (
  params: SearchParamsLike,
  primaryKey: string,
  legacyKey: string
) => params.get(primaryKey) ?? params.get(legacyKey)

const buildSearchParams = ({
  query,
  selectedSuggestions,
  page,
  sortField,
  sortOrder
}: {
  query: string
  selectedSuggestions: SearchSuggestionType[]
  page: number
  sortField: SortField
  sortOrder: SortOrder
}) => {
  const params = new URLSearchParams()

  if (query.trim()) {
    params.set(QUERY_PARAM_KEYS.query, query.trim())
  }

  selectedSuggestions.forEach((item) => {
    params.append(
      item.type === 'tag' ? QUERY_PARAM_KEYS.tag : QUERY_PARAM_KEYS.keyword,
      item.name.trim()
    )
  })

  if (page > 1 && selectedSuggestions.length > 0) {
    params.set(QUERY_PARAM_KEYS.page, String(page))
  }

  if (sortField !== DEFAULT_SORT_FIELD) {
    params.set(QUERY_PARAM_KEYS.sortField, sortField)
  }

  if (sortOrder !== DEFAULT_SORT_ORDER) {
    params.set(QUERY_PARAM_KEYS.sortOrder, sortOrder)
  }

  return params
}

export const SearchPage = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const latestSearchRequestIdRef = useRef(0)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialState = useMemo(
    () => ({
      query:
        readSearchParam(searchParams, QUERY_PARAM_KEYS.query, 'query') ?? '',
      selectedSuggestions: parseSuggestionsFromParams(searchParams),
      page: parsePositiveInt(
        readSearchParam(searchParams, QUERY_PARAM_KEYS.page, 'page'),
        1
      ),
      sortField: SEARCH_SORT_FIELDS.includes(
        readSearchParam(
          searchParams,
          QUERY_PARAM_KEYS.sortField,
          'sortField'
        ) as SortField
      )
        ? (readSearchParam(
            searchParams,
            QUERY_PARAM_KEYS.sortField,
            'sortField'
          ) as SortField)
        : DEFAULT_SORT_FIELD,
      sortOrder:
        readSearchParam(
          searchParams,
          QUERY_PARAM_KEYS.sortOrder,
          'sortOrder'
        ) === 'asc' ||
        readSearchParam(
          searchParams,
          QUERY_PARAM_KEYS.sortOrder,
          'sortOrder'
        ) === 'desc'
          ? (readSearchParam(
              searchParams,
              QUERY_PARAM_KEYS.sortOrder,
              'sortOrder'
            ) as SortOrder)
          : DEFAULT_SORT_ORDER
    }),
    [searchParams]
  )

  const [query, setQuery] = useState(initialState.query)
  const [debouncedQuery] = useDebounce(query, 500)
  const [hasSearched, setHasSearched] = useState(
    initialState.selectedSuggestions.length > 0
  )
  const [patches, setPatches] = useState<GalgameCard[]>([])
  const [hiddenCount, setHiddenCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<
    SearchSuggestionType[]
  >(initialState.selectedSuggestions)
  const [page, setPage] = useState(initialState.page)
  const [total, setTotal] = useState(0)
  const [sortField, setSortField] = useState<SortField>(initialState.sortField)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialState.sortOrder)
  const [showHistory, setShowHistory] = useState(false)

  const searchData = useSearchStore((state) => state.data)
  const setSearchData = useSearchStore((state) => state.setData)

  const [searchStoreHydrated, setSearchStoreHydrated] = useState(false)
  useEffect(() => {
    if (useSearchStore.persist.hasHydrated()) {
      setSearchStoreHydrated(true)
      return
    }
    return useSearchStore.persist.onFinishHydration(() => {
      setSearchStoreHydrated(true)
    })
  }, [])

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

  const handleSelectedSuggestionsChange = (
    value: SetStateAction<SearchSuggestionType[]>
  ) => {
    setPage(1)
    setSelectedSuggestions(value)
  }

  const handleSortFieldChange = (value: SortField) => {
    setPage(1)
    setSortField(value)
  }

  const handleSortOrderChange = (value: SortOrder) => {
    setPage(1)
    setSortOrder(value)
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
    setQuery((current: string) =>
      current === initialState.query ? current : initialState.query
    )
    setSelectedSuggestions((current) => {
      const currentSerialized = JSON.stringify(current)
      const nextSerialized = JSON.stringify(initialState.selectedSuggestions)
      return currentSerialized === nextSerialized
        ? current
        : initialState.selectedSuggestions
    })
    setPage((current) =>
      current === initialState.page ? current : initialState.page
    )
    setSortField((current) =>
      current === initialState.sortField ? current : initialState.sortField
    )
    setSortOrder((current) =>
      current === initialState.sortOrder ? current : initialState.sortOrder
    )
    setHasSearched(initialState.selectedSuggestions.length > 0)
  }, [initialState])

  useEffect(() => {
    const nextQuery = buildSearchParams({
      query,
      selectedSuggestions,
      page,
      sortField,
      sortOrder
    }).toString()
    const currentQuery = searchParams.toString()

    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false
      })
    }
  }, [
    page,
    pathname,
    query,
    router,
    searchParams,
    selectedSuggestions,
    sortField,
    sortOrder
  ])

  useEffect(() => {
    if (selectedSuggestions.length) {
      if (!searchStoreHydrated) {
        return
      }
      void handleSearch()
      return
    }

    latestSearchRequestIdRef.current += 1
    setPatches([])
    setHiddenCount(0)
    setHasSearched(false)
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
    searchData.searchInCompany,
    searchStoreHydrated
  ])

  const showHiddenHint = hiddenCount > 0

  return (
    <div className="relative my-4 w-full space-y-6">
      <KunHeader
        name="搜索游戏"
        headerEndContent={<SearchOption />}
        endContent={
          <div className="text-default-500">
            <p>
              支持按游戏标题、详情正文、标签、会社名称进行单一或联合模糊搜索。
            </p>
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
        setSelectedSuggestions={handleSelectedSuggestionsChange}
        setShowHistory={setShowHistory}
      />

      {showSuggestions ? (
        <SearchSuggestion
          inputRef={inputRef}
          query={debouncedQuery}
          setQuery={setQuery}
          setSelectedSuggestions={handleSelectedSuggestionsChange}
        />
      ) : null}

      <SearchHistory
        showHistory={showHistory}
        setSelectedSuggestions={handleSelectedSuggestionsChange}
        setShowHistory={setShowHistory}
      />

      <FilterBar
        sortField={sortField}
        setSortField={handleSortFieldChange}
        sortOrder={sortOrder}
        setSortOrder={handleSortOrderChange}
      />

      {loading ? (
        <KunLoading hint="正在搜索中..." />
      ) : (
        <div className="space-y-6">
          {patches.length > 0 ? (
            <>
              {showHiddenHint ? (
                <NsfwVisibilityHint count={hiddenCount} />
              ) : null}

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
                  <p>请尝试使用游戏的日文原名、标签或会社名称继续搜索。</p>
                </div>
              </div>
            )
          ) : null}
        </div>
      )}
    </div>
  )
}
