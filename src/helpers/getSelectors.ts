import type { PlasmoGetInlineAnchor } from "plasmo"

export function getPageSelectors() {
  const pathname = window.location.pathname

  if (pathname === "/results") {
    return {
      card: "ytd-video-renderer:not([data-date-processed])",
      anchor: "a#video-title",
      dateSpan: "#metadata-line span.inline-metadata-item"
    }
  }

  if (pathname.endsWith("/featured")) {
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
    return document.querySelector("ytd-search ytd-continuation-item-renderer")

  return document.querySelector(
    "ytd-rich-grid-renderer ytd-continuation-item-renderer"
  )
}

type PromiseType = Promise<HTMLElement>

// where we will put load more button
export const getLoadMoreButtonPlace: PlasmoGetInlineAnchor =
  async function (): PromiseType {
    const pathname = window.location.pathname

    if (pathname === "/results")
      return document.querySelector("ytd-search ytd-section-list-renderer")

    if (pathname === "/playlist")
      return document.querySelector("ytd-playlist-video-list-renderer")

    return document.querySelector("ytd-rich-grid-renderer")
  }

// where we will put filter buttons
export const getFilterPlace: PlasmoGetInlineAnchor = async (): PromiseType => {
  return document.querySelector(
    "div.grid-subheader.style-scope.ytd-shelf-renderer div#title-container.style-scope.ytd-shelf-renderer"
  )
}
