import type { PlasmoGetInlineAnchor } from "plasmo"

// YouTube's SPA keeps previous pages' containers in the DOM (toggling a
// `hidden` ancestor) instead of removing them on client-side navigation, so a
// plain querySelector can silently match a stale, invisible leftover element.
function isElementVisible(element: Element | null): element is HTMLElement {
  if (!element) return false
  if (element.closest("[hidden]")) return false

  const style = window.getComputedStyle(element)
  if (style.display === "none" || style.visibility === "hidden") return false

  const { height, width } = element.getBoundingClientRect()
  return width > 0 || height > 0
}

//  It filters out anything not actually rendered, including elements our own code deliberately hid (e.g. a continuation item held back during infinite scroll).
function queryVisible<T extends HTMLElement>(selector: string): T | null {
  const candidates = document.querySelectorAll<T>(selector)
  for (const element of candidates) {
    if (isElementVisible(element)) return element // youtube changes element continuously, here we'll find the current element
  }
  return null
}

// Like queryVisible, but only excludes stale duplicates left behind by
// YouTube's SPA caching (an ancestor with the `hidden` attribute) — not
// elements our own code hides intentionally (e.g. the continuation item
// while infinite scroll is blocked).
// only checks for a [hidden] ancestor, skipping the computed-style and bounding-rect checks. It treats an element as valid as long as it's not a stale leftover from YouTube's SPA navigation, even if it's invisible for some other, intentional reason.
function queryInActivePage<T extends HTMLElement>(selector: string): T | null {
  const candidates = document.querySelectorAll<T>(selector)
  for (const element of candidates) {
    if (!element.closest("[hidden]")) return element
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
    return queryInActivePage("ytd-search ytd-continuation-item-renderer")

  if (pathname === "/playlist")
    return queryInActivePage(
      "ytd-playlist-video-list-renderer ytd-continuation-item-renderer"
    )

  return queryInActivePage(
    "ytd-rich-grid-renderer ytd-continuation-item-renderer"
  )
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
