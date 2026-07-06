import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"

import { getCommentsPlace } from "~helpers/getSelectors"
import { useCommentsInfiniteScrollBlocker } from "~hooks/useCommentsInfiniteScrollBlocker"

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

export const getInlineAnchor = getCommentsPlace

const loadMoreCommentsButton = () => {
  const { isLoading, loadingText, buttonText, handleLoadMore } =
    useCommentsInfiniteScrollBlocker()

  return (
    <div className="custom-btn-container">
      <button
        className={`custom-trigger-btn ${isLoading ? "loading" : ""}`}
        onClick={handleLoadMore}
        disabled={isLoading}>
        {isLoading ? loadingText : buttonText}
      </button>
    </div>
  )
}

export default loadMoreCommentsButton
