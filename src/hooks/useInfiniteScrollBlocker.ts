import { useEffect, useRef, useState } from "react"

import { triggerDateProcessor } from "~contents/dateReplacer"
import { getContinuationItem, getPageSelectors } from "~helpers/getSelectors"
import { loadingButton } from "~helpers/translationObject"

export const useInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const infiniteScrollObserverRef = useRef<MutationObserver | null>(null)
  const loadingObserverRef = useRef<MutationObserver | null>(null)

  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadMoreText } = loadingButton[currentLang]

  const disableInfiniteScroll = () => {
    const continuationItem = getContinuationItem()
    if (continuationItem && continuationItem.style.display !== "none") {
      continuationItem.style.display = "none"
    }
  }

  const disableInfiniteScroll_observer = () => {
    if (infiniteScrollObserverRef.current) return
    disableInfiniteScroll()
    infiniteScrollObserverRef.current = new MutationObserver(() =>
      disableInfiniteScroll()
    )
    infiniteScrollObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  const reEnableInfiniteScroll = () => {
    if (infiniteScrollObserverRef.current) {
      infiniteScrollObserverRef.current.disconnect()
      infiniteScrollObserverRef.current = null
    }
  }

  useEffect(() => {
    disableInfiniteScroll_observer()

    const resetForNewPage = () => {
      if (infiniteScrollObserverRef.current) {
        infiniteScrollObserverRef.current.disconnect()
        infiniteScrollObserverRef.current = null
      }
      setHasMore(true)
      setIsLoading(false)
    }

    window.addEventListener("yt-navigate-finish", resetForNewPage)

    return () => {
      reEnableInfiniteScroll()
      window.removeEventListener("yt-navigate-finish", resetForNewPage)
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
    reEnableInfiniteScroll()

    continuationItem.style.display = "block"
    const selectors = getPageSelectors()

    loadingObserverRef.current = new MutationObserver(
      (mutations, observerInstance) => {
        const newVideos = Array.from(
          document.querySelectorAll(selectors.card)
        ).filter((card) => card.querySelector(selectors.anchor))

        const currentContinuation = getContinuationItem()

        const stopLoading = () => {
          observerInstance.disconnect()
          loadingObserverRef.current = null
          setIsLoading(false)
        }

        if (newVideos.length) {
          stopLoading()
          disableInfiniteScroll_observer()
        } else if (!currentContinuation) {
          stopLoading()
          setHasMore(false)
        }
      }
    )

    loadingObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  return { isLoading, hasMore, loadingText, loadMoreText, handleLoadMore }
}
