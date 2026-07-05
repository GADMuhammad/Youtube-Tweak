import type { PlasmoGetInlineAnchor } from "plasmo"

// YouTube's SPA keeps previous pages' containers in the DOM (toggling a
// `hidden` ancestor) instead of removing them on client-side navigation, so a
// plain querySelector can silently match a stale, invisible leftover element.
function isElementVisible(el: Element | null): el is Element {
  if (!el) return false
  if (el.closest("[hidden]")) return false

  const style = window.getComputedStyle(el)
  if (style.display === "none" || style.visibility === "hidden") return false

  const rect = el.getBoundingClientRect()
  return rect.width > 0 || rect.height > 0
}

function queryVisible<T extends Element>(selector: string): T | null {
  const candidates = document.querySelectorAll<T>(selector)
  for (const el of candidates) {
    if (isElementVisible(el)) return el
  }
  return null
}

export function getPageSelectors() {
  const pathname = window.location.pathname

  if (pathname === "/results") {
    return {
      card: "ytd-video-renderer:not([data-date-processed])",
      anchor: "a#video-title",
      dateSpan: "#metadata-line span.inline-metadata-item"
    }
  }

  if (pathname.match(/\/@[^\/]+\/?$/) || pathname.endsWith("/featured")) {
    return {
      card: "yt-lockup-view-model:not([data-date-processed])",
      anchor: "a[href*='watch?v=']",
      dateSpan:
        "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
    }
  }

  if (pathname === "/playlist") {
    return {
      card: "ytd-playlist-video-renderer:not([data-date-processed]).style-scope.ytd-playlist-video-list-renderer",
      anchor: "a#video-title",
      dateSpan:
        "yt-formatted-string#video-info span.style-scope.yt-formatted-string"
    }
  }

  return {
    card: "ytd-rich-item-renderer:not([data-date-processed])",
    anchor: "a.ytLockupMetadataViewModelTitle",
    dateSpan:
      "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
  }
}

export function getContinuationItem(): HTMLElement | null {
  const pathname = window.location.pathname
  if (pathname === "/results")
    return queryVisible("ytd-search ytd-continuation-item-renderer")

  return queryVisible("ytd-rich-grid-renderer ytd-continuation-item-renderer")
}

type PromiseType = Promise<HTMLElement>

// where we will put load more button
export const getLoadMoreButtonPlace: PlasmoGetInlineAnchor =
  async function (): PromiseType {
    const pathname = window.location.pathname

    if (pathname === "/results")
      return queryVisible("ytd-search ytd-section-list-renderer")

    if (pathname === "/playlist")
      return queryVisible("ytd-playlist-video-list-renderer")

    return queryVisible("ytd-rich-grid-renderer")
  }

// where we will put filter buttons
export const getFilterPlace: PlasmoGetInlineAnchor = async (): PromiseType => {
  if (!window.location.pathname.startsWith("/feed/subscriptions")) return null

  return queryVisible(
    "div.grid-subheader.style-scope.ytd-shelf-renderer div#title-container.style-scope.ytd-shelf-renderer"
  )
}
