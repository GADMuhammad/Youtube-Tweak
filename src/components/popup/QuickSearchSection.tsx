import { useState } from "react"

import { quickSearchSectionText } from "~helpers/translationObject"

import { SearchIcon } from "./icons"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = quickSearchSectionText[isArabic ? "ar" : "en"]

const isMac = navigator.platform.toLowerCase().includes("mac")
const shortcutPrefix = isMac ? "⌘" : "Ctrl "

// Placeholder rows only, so the layout can be reviewed before the real
// YouTube autocomplete fetch is wired up.
function getMockSuggestions(query: string): string[] {
  if (!query.trim()) return []
  return Array.from({ length: 9 }, (_, i) => `${query} ${i + 1}`)
}

export function QuickSearchSection() {
  const [value, setValue] = useState("")
  const suggestions = getMockSuggestions(value)

  return (
    <div className="popup-quicksearch">
      <div className="popup-quicksearch__box">
        <SearchIcon />
        <input
          className="popup-quicksearch__input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={text.searchPlaceholder}
        />
      </div>

      {suggestions.length > 0 && (
        <div className="popup-quicksearch__list">
          {suggestions.map((suggestion, i) => (
            <div key={suggestion} className="popup-quicksearch__row">
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
