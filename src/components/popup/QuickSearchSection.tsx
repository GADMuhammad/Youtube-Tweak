import { useEffect, useRef, useState } from "react"

import { quickSearchSectionText } from "~helpers/translationObject"
import { fetchYoutubeSuggestions, youtubeSearchUrl } from "~helpers/youtubeSuggest"

import { SearchIcon } from "./icons"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = quickSearchSectionText[isArabic ? "ar" : "en"]
const lang = isArabic ? "ar" : "en"

const isMac = navigator.platform.toLowerCase().includes("mac")
const shortcutPrefix = isMac ? "⌘" : "Ctrl "

const DEBOUNCE_MS = 130
const MAX_SUGGESTIONS = 9

function openInNewTab(url: string) {
  chrome.tabs.create({ url })
}

export function QuickSearchSection() {
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const trimmed = value.trim()
    if (!trimmed) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const results = await fetchYoutubeSuggestions(
          trimmed,
          lang,
          controller.signal
        )
        setSuggestions(results)
      } catch {
        // Network failure or abort: leave suggestions empty, Enter still
        // works off the raw query below regardless of fetch outcome.
        if (!controller.signal.aborted) setSuggestions([])
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [value])

  const trimmedValue = value.trim().toLowerCase()
  const visibleSuggestions = suggestions
    .filter((s) => s.trim().toLowerCase() !== trimmedValue)
    .slice(0, MAX_SUGGESTIONS)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey
      if (!modifierPressed) return

      const digit = Number(e.key)
      if (!Number.isInteger(digit) || digit < 1 || digit > 9) return

      const suggestion = visibleSuggestions[digit - 1]
      if (!suggestion) return

      e.preventDefault()
      openInNewTab(youtubeSearchUrl(suggestion))
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [visibleSuggestions])

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    openInNewTab(youtubeSearchUrl(value))
  }

  return (
    <div className="popup-quicksearch">
      <div className="popup-quicksearch__box">
        <SearchIcon />
        <input
          ref={inputRef}
          className="popup-quicksearch__input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={text.searchPlaceholder}
        />
      </div>

      {visibleSuggestions.length > 0 && (
        <div className="popup-quicksearch__list">
          {visibleSuggestions.map((suggestion, i) => (
            <div
              key={suggestion}
              className="popup-quicksearch__row"
              role="button"
              tabIndex={0}
              onClick={() => openInNewTab(youtubeSearchUrl(suggestion))}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return
                e.preventDefault()
                openInNewTab(youtubeSearchUrl(suggestion))
              }}>
              <span className="popup-quicksearch__row-text">{suggestion}</span>
              <span className="popup-quicksearch__chip" dir="ltr">
                {shortcutPrefix}
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
