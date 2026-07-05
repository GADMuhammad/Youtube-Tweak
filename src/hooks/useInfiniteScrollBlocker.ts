import { useEffect, useRef, useState } from "react"

import { triggerDateProcessor } from "~contents/dateReplacer"
import { getContinuationItem, getPageSelectors } from "~helpers/getSelectors"
import { loadingButton } from "~helpers/translationObject"

export const useInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const blockObserverRef = useRef<MutationObserver | null>(null)
  const loadingObserverRef = useRef<MutationObserver | null>(null)

  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadMoreText } = loadingButton[currentLang]

  const hideContinuationItem = () => {
    const continuationItem = getContinuationItem()
    if (continuationItem && continuationItem.style.display !== "none") {
      continuationItem.style.display = "none"
    }
  }

  const startBlocking = () => {
    if (blockObserverRef.current) return
    hideContinuationItem()
    blockObserverRef.current = new MutationObserver(hideContinuationItem)
    blockObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  const stopBlocking = () => {
    if (blockObserverRef.current) {
      blockObserverRef.current.disconnect()
      blockObserverRef.current = null
    }
  }

  useEffect(() => {
    startBlocking()

    return () => {
      stopBlocking()
      if (loadingObserverRef.current) {
        loadingObserverRef.current.disconnect()
        loadingObserverRef.current = null
      }
    }
  }, [])

  const handleLoadMore = () => {
    if (isLoading || !hasMore) return

    const continuationItem = getContinuationItem()
    if (!continuationItem) {
      setHasMore(false)
      return
    }

    setIsLoading(true)
    triggerDateProcessor()
    stopBlocking()

    continuationItem.style.display = "block"
    const selectors = getPageSelectors()

    loadingObserverRef.current = new MutationObserver((_, observerInstance) => {
      const newCards = Array.from(
        document.querySelectorAll(selectors.card)
      ).filter((card) => card.querySelector(selectors.anchor))

      const stopLoading = () => {
        observerInstance.disconnect()
        loadingObserverRef.current = null
        setIsLoading(false)
      }

      if (newCards.length) {
        stopLoading()
        startBlocking()
      } else if (!getContinuationItem()) {
        stopLoading()
        setHasMore(false)
      }
    })

    loadingObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  return { isLoading, hasMore, loadingText, loadMoreText, handleLoadMore }
}
