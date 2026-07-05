import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useState } from "react"

import { getFilterPlace } from "~helpers/getSelectors"
import { filterTabsText } from "~helpers/translationObject"
import useYoutubeThemeAndDom from "~hooks/useYoutubeThemeAndDom"

// Broad match: Chrome only injects content_scripts on real navigations, not
// SPA route changes, so getFilterPlace gates the actual mount to /feed/subscriptions.
export const config: PlasmoCSConfig = {
  matches: ["https://*.youtube.com/*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

// The container above videos:
export const getInlineAnchor = getFilterPlace

// Append the button at the top of the targeted container:
export const getMountPoint = (anchor: HTMLElement) => {
  return anchor.firstElementChild as HTMLElement
}

const getTabFromUrl = () =>
  window.location.href.includes("/shorts") ? "shorts" : "videos"

const FilterTabs = () => {
  const [currentTab, setCurrentTab] = useState(getTabFromUrl)

  useEffect(() => {
    const handleNavigate = () => setCurrentTab(getTabFromUrl())
    window.addEventListener("yt-navigate-finish", handleNavigate)
    return () =>
      window.removeEventListener("yt-navigate-finish", handleNavigate)
  }, [])

  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"

  const { videos, shorts } = filterTabsText[currentLang]
  const filterButtons = [
    {
      id: "videos",
      label: videos,
      url: "https://www.youtube.com/feed/subscriptions"
    },
    {
      id: "shorts",
      label: shorts,
      url: "https://www.youtube.com/feed/subscriptions/shorts"
    }
  ]
  const { isDarkMode } = useYoutubeThemeAndDom() // custom hook for filer buttons UI

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    url: string
  ) => {
    e.preventDefault()
    window.location.href = url
  }

  return (
    <div
      className={`custom-filter-chips ${isDarkMode ? "theme-dark" : "theme-light"}`}>
      {filterButtons.map(({ label, url, id }) => (
        <a
          key={label}
          href={url}
          onClick={(e) => handleNavigation(e, url)}
          className={`yt-chip-btn ${currentTab === id ? "yt-chip-active" : ""}`}>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </a>
      ))}
    </div>
  )
}

export default FilterTabs
