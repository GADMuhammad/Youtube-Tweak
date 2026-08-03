import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { getFilterPlace } from "~helpers/getSelectors"
import { filterTabsText } from "~helpers/translationObject"
import useYoutubeThemeAndDom from "~hooks/useYoutubeThemeAndDom"

// Matched broadly (like the other content scripts) because Chrome only
// injects content scripts on a real navigation/frame load, not on YouTube's
// SPA route changes — a narrower match here would leave this script
// uninjected if the extension first loaded on some other YouTube page.
// getFilterPlace() below already restricts rendering to the subscriptions feed.
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

// Scopes the :host reset in style.scss to just this CSUI's shadow host,
// instead of every plasmo-csui on the page.
export const getShadowHostId = () => "yt-tweak-filter-tabs-host"

const getTabFromUrl = () =>
  window.location.href.includes("/shorts") ? "shorts" : "videos"

// YouTube's own SPA router intercepts clicks on light-DOM <a> elements via a
// document-level listener. Our anchors live inside plasmo-csui's shadow DOM,
// so that listener sees the shadow host as the click target (event
// retargeting), never recognizes it as a navigable link, and lets the click
// fall through to native anchor navigation — a hard reload. Synthesizing a
// click on a throwaway <a> appended to the light DOM sidesteps that:
// YouTube's listener treats it exactly like clicking any other in-page link
// and performs its client-side transition instead.
const navigateSpa = (url: string) => {
  const link = document.createElement("a")
  link.href = url
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  link.remove()
}

// Modifier/middle clicks are left alone so opening in a new tab, copying the
// link, etc. keep working via the anchor's native href.
const handleClick = (
  event: React.MouseEvent<HTMLAnchorElement>,
  url: string
) => {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return

  event.preventDefault()
  navigateSpa(url)
}

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

  return (
    <div
      className={`custom-filter-chips ${isDarkMode ? "theme-dark" : "theme-light"}`}>
      {filterButtons.map(({ label, url, id }) => (
        <a
          key={label}
          href={url}
          onClick={(event) => handleClick(event, url)}
          className={`yt-chip-btn ${currentTab === id ? "yt-chip-active" : ""}`}>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </a>
      ))}
    </div>
  )
}

export default FilterTabs
