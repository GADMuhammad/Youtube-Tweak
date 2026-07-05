import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"

import { getLoadMoreButtonPlace } from "~helpers/getSelectors"
import { useInfiniteScrollBlocker } from "~hooks/useInfiniteScrollBlocker"

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

export const getInlineAnchor = getLoadMoreButtonPlace

// Append the button at the end of the targeted container:
export const getMountPoint = (anchor: HTMLElement) => anchor

const PlasmoInlineButton = () => {
  // console.log("LoadMore mounted", location.href)
  const { isLoading, loadingText, loadMoreText, handleLoadMore } =
    useInfiniteScrollBlocker()

  // if (!hasMore) {
  //     return (
  //       <div className="custom-btn-container">
  //         <p className="no-more-videos-msg">
  //           {currentLang === "ar" ? "لا توجد فيديوهات أخرى" : "No more videos"}
  //         </p>
  //       </div>
  //     )
  //   }

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

export default PlasmoInlineButton
