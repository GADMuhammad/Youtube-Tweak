import { useEffect, useRef, useState } from "react"

import { quickSearchSectionText } from "~helpers/translationObject"
import {
  fetchYoutubeSuggestions,
  youtubeSearchUrl
} from "~helpers/youtubeSuggest"

import { ClearIcon, SearchIcon } from "./icons"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = quickSearchSectionText[isArabic ? "ar" : "en"]
const lang = isArabic ? "ar" : "en"

const isMac = navigator.platform.toLowerCase().includes("mac")
const shortcutPrefix = isMac ? "⌘" : "Ctrl "

const DEBOUNCE_MS = 100
const MAX_SUGGESTIONS = 9

function openInNewTab(url: string) {
  chrome.tabs.create({ url })
}

export function QuickSearchSection() {
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

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
    if (e.key === "Enter") {
      openInNewTab(youtubeSearchUrl(value))
      return
    }

    if (e.key === "ArrowDown" && rowRefs.current[0]) {
      e.preventDefault()
      rowRefs.current[0]?.focus()
    }

    if (e.key === "ArrowUp" && rowRefs.current[visibleSuggestions.length - 1]) {
      e.preventDefault()
      rowRefs.current[visibleSuggestions.length - 1]?.focus()
    }
  }

  function handleRowKeyDown(
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openInNewTab(youtubeSearchUrl(visibleSuggestions[index]))
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (index === visibleSuggestions.length - 1) inputRef.current?.focus()
      else rowRefs.current[index + 1]?.focus()
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (index === 0) inputRef.current?.focus()
      else rowRefs.current[index - 1]?.focus()
    }

    if (e.key === "Backspace") inputRef.current?.focus()
  }

  return (
    <div className="popup-quicksearch">
      <div className="popup-quicksearch__box">
        <SearchIcon />
        <input
          ref={inputRef}
          className="popup-quicksearch__input"
          type="text"
          dir={value ? "auto" : isArabic ? "rtl" : "ltr"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={text.searchPlaceholder}
        />
        {!!value.length && (
          <button
            type="button"
            className="popup-quicksearch__clear"
            aria-label={text.clear}
            tabIndex={-1}
            onClick={() => {
              setValue("")
              inputRef.current?.focus()
            }}>
            <ClearIcon />
          </button>
        )}
      </div>

      {visibleSuggestions.length ? (
        <div className="popup-quicksearch__list">
          {visibleSuggestions.map((suggestion, i) => (
            <div
              key={suggestion}
              ref={(el) => (rowRefs.current[i] = el)}
              className="popup-quicksearch__row"
              role="button"
              tabIndex={0}
              onClick={() => openInNewTab(youtubeSearchUrl(suggestion))}
              onKeyDown={(e) => handleRowKeyDown(e, i)}>
              <span className="popup-quicksearch__row-text" dir="auto">
                {suggestion}
              </span>
              <span className="popup-quicksearch__chip" dir="ltr">
                {shortcutPrefix}
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="popup-quicksearch__empty">
          <SearchIcon size={32} />
          <span>{text.emptyState}</span>
        </div>
      )}
    </div>
  )
}
