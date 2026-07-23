import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"

import { LoadMoreButton } from "~components/LoadMoreButton"
import { getLoadMoreButtonPlace } from "~helpers/getSelectors"
import { noMoreText } from "~helpers/translationObject"
import { useInfiniteScrollBlocker } from "~hooks/useInfiniteScrollBlocker"

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

export const getInlineAnchor = getLoadMoreButtonPlace

const loadMoreButton = () => {
  if (
    window.location.pathname === "/playlist" &&
    document.querySelector("yt-section-list-renderer")
  )
    return

  const { isLoading, situation, loadingText, buttonText, handleLoadMore } =
    useInfiniteScrollBlocker()

  // sometimes it happens in youtube like if you have no subscriptions, or you turn of history.
  if (situation === "None") return null

  if (situation === "NoMore") {
    const currentLang = document.documentElement.lang?.startsWith("ar")
      ? "ar"
      : "en"

    return (
      <div className="custom-btn-container">
        <p className="no-more-videos-msg">{noMoreText[currentLang]}</p>
      </div>
    )
  }

  return (
    <LoadMoreButton
      isLoading={isLoading}
      loadingText={loadingText}
      buttonText={buttonText}
      onClick={handleLoadMore}
    />
  )
}

export default loadMoreButton
