export interface SearchSuggestionType {
  type: 'keyword' | 'tag'
  name: string
}

export interface SearchResponse {
  galgames: GalgameCard[]
  total: number
  hiddenCount: number
}
