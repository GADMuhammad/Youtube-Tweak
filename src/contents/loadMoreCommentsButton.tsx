import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"

import { LoadMoreButton } from "~components/LoadMoreButton"
import { getCommentsPlace } from "~helpers/getSelectors"
import { noMoreCommentsText } from "~helpers/translationObject"
import { useCommentsInfiniteScrollBlocker } from "~hooks/useCommentsInfiniteScrollBlocker"

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

export const getInlineAnchor = getCommentsPlace

const loadMoreCommentsButton = () => {
  const {
    isLoading,
    commentsSituation,
    loadingText,
    buttonText,
    handleLoadMore
  } = useCommentsInfiniteScrollBlocker()

  // comments turned off by the uploader — nothing to load, ever
  if (commentsSituation === "NoComments") return null

  if (commentsSituation === "NoMoreComments") {
    const currentLang = document.documentElement.lang?.startsWith("ar")
      ? "ar"
      : "en"

    return (
      <div className="custom-btn-container">
        <p className="no-more-videos-msg">{noMoreCommentsText[currentLang]}</p>
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

export default loadMoreCommentsButton
