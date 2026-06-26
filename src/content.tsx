import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"

import { useInfiniteScrollBlocker } from "~hooks/useInfiniteScrollBlocker"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

// 🎯 Target YouTube's feed grid container to mount the button inline
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  // the container which contains the whole videos:
  return document.querySelector("ytd-rich-grid-renderer")
}

// 🎯 Append the button at the end of the targeted container
export const getMountPoint = (anchor: HTMLElement) => {
  return anchor
}

const PlasmoInlineButton = () => {
  const { isLoading, loading, loadMore, handleLoadMore } =
    useInfiniteScrollBlocker()

  return (
    <div className="custom-btn-container">
      <button
        className={`custom-trigger-btn ${isLoading ? "loading" : ""}`}
        onClick={handleLoadMore}
        disabled={isLoading}>
        {isLoading ? loading : loadMore}
      </button>
    </div>
  )
}

export default PlasmoInlineButton
