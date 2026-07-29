// client=firefox returns clean JSON (["query", ["s1", "s2", ...]]) instead of
// the default JSONP-wrapped response, so no script-injection workaround is needed.
export async function fetchYoutubeSuggestions(
  query: string,
  lang: string,
  signal: AbortSignal
): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${encodeURIComponent(lang)}&q=${encodeURIComponent(query)}`

  const response = await fetch(url, { signal })
  if (!response.ok) return []

  const data = await response.json()
  const suggestions = data?.[1]
  if (!Array.isArray(suggestions)) return []

  return suggestions.filter((s): s is string => typeof s === "string")
}

export function youtubeSearchUrl(query: string): string {
  const trimmed = query.trim()
  if (!trimmed) return "https://www.youtube.com/"
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmed)}`
}
