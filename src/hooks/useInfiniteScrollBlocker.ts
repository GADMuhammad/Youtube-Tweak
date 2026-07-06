import { triggerDateProcessor } from "~contents/dateReplacer"
import { getContinuationItem, getPageSelectors } from "~helpers/getSelectors"
import { loadingButton } from "~helpers/translationObject"

import { useLoadMoreBlocker } from "./useLoadMoreBlocker"

const countVideos = () => {
  const selectors = getPageSelectors()
  const cleanCardSelector = selectors.card.replace(
    ":not([data-date-processed])",
    ""
  )
  return document.querySelectorAll(cleanCardSelector).length
}

const hasNewContent = () => {
  const selectors = getPageSelectors()
  return Array.from(document.querySelectorAll(selectors.card)).some((card) =>
    card.querySelector(selectors.anchor)
  )
}

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
