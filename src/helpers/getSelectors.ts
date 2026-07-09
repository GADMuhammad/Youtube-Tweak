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
      container: "ytd-search", // the loading element
      card: "ytd-video-renderer",
      anchor: "a#video-title",
      dateSpan: "#metadata-line span.inline-metadata-item"
    }
  }

  if (
    pathname.match(/\/@[^\/]+\/?$/) ||
    pathname.endsWith("/featured") ||
    pathname === "/watch"
  ) {
    return {
      container:
        pathname === "/watch"
          ? "ytd-watch-next-secondary-results-renderer"
          : "ytd-rich-grid-renderer",
      card: "yt-lockup-view-model",
      anchor: "a[href*='watch?v=']",
      dateSpan:
        "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
    }
  }

  if (pathname === "/playlist") {
    return {
      container: "ytd-playlist-video-list-renderer",
      card: "ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer",
      anchor: "a#video-title",
      dateSpan:
        "yt-formatted-string#video-info span.style-scope.yt-formatted-string"
    }
  }

  return {
    container: "ytd-rich-grid-renderer",
    card: "ytd-rich-item-renderer",
    // href-based (not class-based) so non-video interstitials rendered with
    // the same card/lockup markup — e.g. the "Your watch history is off"
    // notice on an empty feed — don't get counted as a real video card.
    anchor:
      "a.ytLockupMetadataViewModelTitle[href*='watch?v='], a[href*='/shorts/']",
    dateSpan:
      "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
  }
}

// The active grid/list container for the current page — scoping card counts
// to this (instead of querying the whole document) avoids counting stale
// cards left behind elsewhere in the DOM by YouTube's SPA caching.
export function getActiveContainer(): HTMLElement | null {
  return queryInActivePage(getPageSelectors().container)
}

export function getContinuationItem(): HTMLElement | null {
  const { container } = getPageSelectors()
  return queryInActivePage(`${container} ytd-continuation-item-renderer`)
}

// The comments continuation item lives in the same slot as the per-thread
// "show more replies" continuation, so we must skip any candidate nested
// inside a comment thread's replies renderer — otherwise we'd hide/reveal a
// reply-expander instead of the "load more comment threads" continuation.
export function getCommentsContinuationItem(): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(
    "ytd-comments#comments ytd-continuation-item-renderer"
  )
  for (const element of candidates) {
    if (element.closest("ytd-comment-replies-renderer")) continue
    if (element.closest("[hidden]")) continue
    return element
  }
  return null
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

    if (pathname === "/watch")
      return queryVisible("ytd-watch-next-secondary-results-renderer")

    return queryVisible("ytd-rich-grid-renderer")
  }

// where we will put the load more comments button
export const getCommentsPlace: PlasmoGetInlineAnchor = async (): PromiseType =>
  queryVisible("ytd-comments#comments")

// where we will put filter buttons
export const getFilterPlace: PlasmoGetInlineAnchor = async (): PromiseType => {
  if (!window.location.pathname.startsWith("/feed/subscriptions")) return null

  return queryVisible(
    "div.grid-subheader.style-scope.ytd-shelf-renderer div#title-container.style-scope.ytd-shelf-renderer"
  )
}
