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

// YouTube's SPA router only reacts to clicks on its own already-mounted
// elements — verified empirically: a synthetic click() dispatched straight on
// one of YouTube's real anchors performs a genuine client-side transition
// (page context survives, no reload). Every attempt to fake that ourselves —
// a homemade <a> (even carrying YouTube's own "yt-simple-endpoint" class),
// history.pushState + a synthetic popstate, or dispatching YouTube's
// internal `yt-navigate` event by hand with a fully correct endpoint object
// (browseId "FEsubscriptions_shorts", pulled straight from the page's own
// embedded data, plus a real trusted click event attached) — either
// no-opped silently or fell back to a hard reload. `yt-navigate` turns out
// to be a notification the router *emits* once it's already decided to
// navigate, not a command channel other code can drive.
//
// /feed/subscriptions always has a real anchor in the sidebar (present in
// the DOM even when the sidebar is visually collapsed). /feed/subscriptions/
// shorts has a real anchor too — the "View all" link on the Shorts shelf
// (confirmed a plain `<a href="/feed/subscriptions/shorts">`, not a
// JS-only button as its styling suggests) — but only once that shelf has
// lazy-rendered (it's several rows down, virtualized like the rest of the
// grid) and only for accounts with shelf content at all. When no matching
// anchor exists yet, this falls back to the anchor's native href.
const clickNativeAnchor = (path: string): boolean => {
  const link = document.querySelector<HTMLAnchorElement>(`a[href="${path}"]`)
  link?.click()
  return !!link
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

  const path = new URL(url).pathname
  if (clickNativeAnchor(path)) event.preventDefault()
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
