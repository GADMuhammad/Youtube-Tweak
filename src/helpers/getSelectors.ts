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

// Matches a channel's own search results, e.g. "/@handle/search" — these
// render with the same ytd-video-renderer list structure as the global
// "/results" search page, just without the <ytd-search> wrapper.
function isChannelSearch(pathname: string): boolean {
  return /\/@[^/]+\/search\/?$/.test(pathname)
}

// Matches a channel's "Playlists" tab, e.g. "/@handle/playlists" — exported
// so the load-more button copy can say "playlists" instead of "videos" there.
export function isChannelPlaylistsTab(pathname: string): boolean {
  return /\/@[^/]+\/playlists\/?$/.test(pathname)
}

// Matches a channel's "Posts" (community) tab, e.g. "/@handle/posts" —
// exported so the load-more button copy can say "posts" instead of "videos".
export function isChannelPostsTab(pathname: string): boolean {
  return /\/@[^/]+\/posts\/?$/.test(pathname)
}

export function getPageSelectors() {
  const pathname = window.location.pathname

  if (pathname === "/results" || isChannelSearch(pathname)) {
    return {
      container:
        pathname === "/results" ? "ytd-search" : "ytd-section-list-renderer",
      card: "ytd-video-renderer",
      anchor: "a#video-title",
      dateSpan: "#metadata-line span.inline-metadata-item"
    }
  }

  // Channel "Playlists" tab: unlike the other channel tabs, this renders
  // playlist cards inside an old-style ytd-grid-renderer (nested in
  // ytd-item-section-renderer), not ytd-rich-grid-renderer — so it needs its
  // own case, or its continuation item is never found/blocked.
  if (isChannelPlaylistsTab(pathname)) {
    return {
      container: "ytd-grid-renderer",
      card: "yt-lockup-view-model",
      anchor: "a[href*='/playlist']",
      dateSpan:
        "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
    }
  }

  // Channel "Posts" (community) tab: cards are ytd-backstage-post-thread-
  // renderer inside ytd-backstage-items, not the video-grid structure used
  // by the other channel tabs — needs its own case for the same reason as
  // the Playlists tab above.
  if (isChannelPostsTab(pathname)) {
    return {
      container: "ytd-backstage-items",
      card: "ytd-backstage-post-thread-renderer",
      anchor: "a#author-text",
      dateSpan:
        "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
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

  // local playlists
  if (
    pathname === "/playlist" &&
    document.querySelector("ytd-playlist-video-list-renderer")
  ) {
    return {
      container: "ytd-playlist-video-list-renderer",
      card: "ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer",
      anchor: "a#video-title",
      dateSpan:
        "yt-formatted-string#video-info span.style-scope.yt-formatted-string"
    }
  }

  // remote playlists
  if (
    pathname === "/playlist" &&
    document.querySelector("yt-section-list-renderer")
  ) {
    return {
      container: "yt-section-list-renderer",
      card: "yt-lockup-view-model",
      anchor: "a.ytLockupMetadataViewModelTitle, a[href*='watch?v=']",
      dateSpan:
        "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
    }
  }

  return {
    container: "ytd-rich-grid-renderer",
    card: "ytd-rich-item-renderer",
    anchor:
      "a.ytLockupMetadataViewModelTitle[href*='watch?v='], a[href*='/shorts/']",
    dateSpan:
      "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label], #metadata-line span.inline-metadata-item"
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

export const commentsSection = document.querySelector(
  "ytd-comments#comments.style-scope.ytd-watch-flexy"
) as HTMLElement

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

    if (isChannelSearch(pathname))
      return queryVisible("ytd-section-list-renderer")

    // local playlists
    if (
      pathname === "/playlist" &&
      document.querySelector("ytd-playlist-video-list-renderer")
    )
      return queryVisible("ytd-playlist-video-list-renderer")

    // remote playlists
    if (
      pathname === "/playlist" &&
      document.querySelector("yt-section-list-renderer")
    )
      return queryVisible("yt-item-section-renderer")

    if (pathname === "/watch")
      return queryVisible("ytd-watch-next-secondary-results-renderer")

    // channel playlists tab
    if (isChannelPlaylistsTab(pathname))
      return queryVisible("ytd-grid-renderer")

    // channel posts tab
    if (isChannelPostsTab(pathname)) return queryVisible("ytd-backstage-items")

    return queryVisible("ytd-rich-grid-renderer")
  }

// where we will put the load more comments button
export const getCommentsPlace: PlasmoGetInlineAnchor = async (): PromiseType =>
  queryVisible("ytd-comments#comments")

// where we will put filter buttons
//
// #title-container is the flex row (align-items: center) that also holds a
// flex-grow spacer and the "All subscriptions" button; its parent
// .grid-subheader is a plain block container. Anchoring on #title-container
// itself would make Plasmo insert plasmo-csui *after* it (the default
// "afterend" insertPosition for a bare Element), landing it in the block
// parent as its own full-width row below "All subscriptions" instead of
// alongside it. Anchoring on the (hidden) "Latest" <h2> with insertPosition
// "afterend" instead drops plasmo-csui inside #title-container, before the
// spacer, so it becomes a flex item that sits inline with — and is
// vertically centered against — "All subscriptions".
//
// The Shorts sub-page (/feed/subscriptions/shorts) has no shelf-renderer at
// all — it renders a standalone ytd-rich-grid-renderer whose own
// #title-container just wraps a single #title div reading "Shorts", with no
// sibling button to align against. Same insert-after-the-hidden-heading
// pattern applies there, just against that page's own title element.
export const getFilterPlace: PlasmoGetInlineAnchor = async () => {
  const pathname = window.location.pathname
  if (!pathname.startsWith("/feed/subscriptions")) return null

  const titleContainer = pathname.startsWith("/feed/subscriptions/shorts")
    ? queryVisible<HTMLElement>(
        "ytd-rich-grid-renderer div#title-container.style-scope.ytd-rich-grid-renderer"
      )
    : queryVisible<HTMLElement>(
        "div.grid-subheader.style-scope.ytd-shelf-renderer div#title-container.style-scope.ytd-shelf-renderer"
      )
  const title = titleContainer?.firstElementChild as HTMLElement

  return title ? { element: title, insertPosition: "afterend" } : null
}
