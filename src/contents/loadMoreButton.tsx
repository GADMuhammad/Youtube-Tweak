import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import { getLoadMoreButtonPlace } from "~helpers/getSelectors"
import { useInfiniteScrollBlocker } from "~hooks/useInfiniteScrollBlocker"

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

export const getInlineAnchor = getLoadMoreButtonPlace

const LoadMoreButton = () => {
  const { isLoading, loadingText, loadMoreText, handleLoadMore } =
    useInfiniteScrollBlocker()

  return (
    <div className="custom-btn-container">
      <button
        className={`custom-trigger-btn ${isLoading ? "loading" : ""}`}
        onClick={handleLoadMore}
        disabled={isLoading}>
        {isLoading ? loadingText : loadMoreText}
      </button>
    </div>
  )
}

const loadMoreButton = () => {
  const [navKey, setNavKey] = useState(0)

  useEffect(() => {
    const handleNavigate = () => setNavKey((key) => key + 1)
    window.addEventListener("yt-navigate-finish", handleNavigate)
    return () =>
      window.removeEventListener("yt-navigate-finish", handleNavigate)
  }, [])

  return <LoadMoreButton key={navKey} />
}

export default loadMoreButton
