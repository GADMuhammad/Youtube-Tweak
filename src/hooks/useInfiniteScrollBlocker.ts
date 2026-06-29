import { useEffect, useRef, useState } from "react"

import { triggerDateProcessor } from "~contents/dateReplacer"
import { loadingButton } from "~helpers/translationObject"

export const useInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<MutationObserver | null>(null)
  const loadingObserverRef = useRef<MutationObserver | null>(null)
  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadMoreText } = loadingButton[currentLang]

  const disableInfiniteScroll = () => {
    const continuationItem = document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
    )
    if (
      continuationItem &&
      (continuationItem as HTMLElement).style.display !== "none"
    ) {
      ;(continuationItem as HTMLElement).style.display = "none"
    }
  }

  // Turn on (MutationObserver)
  const startObserver = () => {
    if (observerRef.current) return

    disableInfiniteScroll()

    observerRef.current = new MutationObserver(function () {
      disableInfiniteScroll()
    })

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // 1. Pause the observer to stop overriding styles
  const stopObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }

  useEffect(() => {
    // Initialize the observer when the page loads
    startObserver()
    return () => {
      stopObserver()
      if (loadingObserverRef.current) {
        loadingObserverRef.current.disconnect()
        loadingObserverRef.current = null
      }
    }
  }, [])

  // Simulates an infinite scroll trigger when the user clicks the button
  const handleLoadMore = () => {
    if (isLoading) return
    setIsLoading(true)
    triggerDateProcessor()

    // 1. Pause the observer to stop overriding styles
    stopObserver()

    // 2. Reveal the loader so YouTube's IntersectionObserver can detect it
    const continuationItem = document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
    ) as HTMLElement

    if (continuationItem) {
      continuationItem.style.display = "block" // bring the loader back again with (display: block)
    }

    // the count of the current videos .. to compare it with the count of the total new number with the add videos (if it's existed)
    const currentVideoCount = document.querySelectorAll(
      "ytd-rich-item-renderer"
    ).length

    loadingObserverRef.current = new MutationObserver(
      (mutations, observerInstance) => {
        const newVideoCount: number = document.querySelectorAll(
          "ytd-rich-item-renderer"
        ).length

        if (newVideoCount > currentVideoCount) {
          observerInstance.disconnect()
          loadingObserverRef.current = null
          startObserver()
          setIsLoading(false)
        }
      }
    )

    loadingObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
  return { isLoading, loadingText, loadMoreText, handleLoadMore }
}
