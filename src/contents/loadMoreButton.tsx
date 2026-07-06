import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"

import { LoadMoreButton } from "~components/LoadMoreButton"
import { getLoadMoreButtonPlace } from "~helpers/getSelectors"
import { useInfiniteScrollBlocker } from "~hooks/useInfiniteScrollBlocker"

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

export const getInlineAnchor = getLoadMoreButtonPlace

const loadMoreButton = () => {
  const { isLoading, loadingText, buttonText, handleLoadMore } =
    useInfiniteScrollBlocker()

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
