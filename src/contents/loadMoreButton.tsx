import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"

import { useInfiniteScrollBlocker } from "~hooks/useInfiniteScrollBlocker"

export const config: PlasmoCSConfig = {
  matches: ["https://*.youtube.com/*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  // 1. صفحة البحث (Search Results)
  const searchSection = document.querySelector(
    "ytd-search ytd-section-list-renderer"
  )
  if (searchSection) return searchSection

  // 2. الصفحة الرئيسية والاشتراكات وفيديوهات القنوات (الحاوية الكبيرة للـ Grid)
  const mainGrid = document.querySelector("ytd-rich-grid-renderer")
  if (mainGrid) return mainGrid

  return null
}

// 🎯 Append the button at the end of the targeted container
export const getMountPoint = (anchor: HTMLElement) => anchor

const PlasmoInlineButton = () => {
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

export default PlasmoInlineButton
