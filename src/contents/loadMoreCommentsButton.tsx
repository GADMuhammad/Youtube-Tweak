import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"

import { LoadMoreButton } from "~components/LoadMoreButton"
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
    <LoadMoreButton
      isLoading={isLoading}
      loadingText={loadingText}
      buttonText={buttonText}
      onClick={handleLoadMore}
    />
  )
}

export default loadMoreCommentsButton
