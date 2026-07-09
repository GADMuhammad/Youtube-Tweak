import { triggerDateProcessor } from "~contents/dateReplacer"
import {
  getActiveContainer,
  getContinuationItem,
  getPageSelectors
} from "~helpers/getSelectors"
import { loadingButton } from "~helpers/translationObject"

import { useLoadMoreBlocker } from "./useLoadMoreBlocker"

const countVideos = () => {
  const container = getActiveContainer()
  if (!container) return 0

  const selectors = getPageSelectors()
  // YouTube reuses the same card wrapper tag for non-video interstitials too
  // (e.g. the "Your watch history is off" notice on an empty feed), so only
  // count elements that actually contain a video-title anchor.
  return Array.from(container.querySelectorAll(selectors.card)).filter(
    (card) => card.querySelector(selectors.anchor)
  ).length
}

// "New content" means more video cards than before the load-more click —
// counting directly rather than relying on any per-card processed marker,
// since those track date-formatting state, not arrival order.
const hasNewContent = (countBefore: number) => countVideos() > countBefore

export const useInfiniteScrollBlocker = () => {
  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadMoreText: buttonText } = loadingButton[currentLang]

  const { isLoading, situation, handleLoadMore } = useLoadMoreBlocker({
    getContinuationItem,
    countItems: countVideos,
    hasNewContent,
    onReveal: triggerDateProcessor
  })

  return { isLoading, situation, loadingText, buttonText, handleLoadMore }
}
