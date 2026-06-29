import { useEffect, useRef, useState } from "react"

import { triggerDateProcessor } from "~contents/dateReplacer"
import { loadingButton } from "~helpers/translationObject"

export const useInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false) // are we loading new videos now??
  const infiniteScrollObserverRef = useRef<MutationObserver | null>(null) // the observer which hide infinite scroll element
  const loadingObserverRef = useRef<MutationObserver | null>(null) // a temp observer, we use it only when we need to load more videos. when click (load more) button
  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadMoreText } = loadingButton[currentLang]

  const disableInfiniteScroll = () => {
    const continuationItem = document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
    ) as HTMLElement
    if (continuationItem && continuationItem.style.display !== "none") {
      continuationItem.style.display = "none"
    }
  }

  // Turn on (MutationObserver) to disable infinite scroll
  const disableInfiniteScrollObserver = () => {
    if (infiniteScrollObserverRef.current) return

    disableInfiniteScroll()

    infiniteScrollObserverRef.current = new MutationObserver(function () {
      disableInfiniteScroll()
    })

    infiniteScrollObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // to stop the observer temporarily until we load new videos
  const stopObserver = () => {
    if (infiniteScrollObserverRef.current) {
      infiniteScrollObserverRef.current.disconnect()
      infiniteScrollObserverRef.current = null
    }
  }

  useEffect(() => {
    // Initialize the observer when the page loads
    disableInfiniteScrollObserver()

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
    // console.log("handleLoadMore")
    setIsLoading(true)
    triggerDateProcessor()

    // until we load the new videos and we'll turn it on again
    stopObserver()

    // Reveal the loader so YouTube's IntersectionObserver can detect it
    const continuationItem = document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
    ) as HTMLElement

    if (continuationItem) {
      continuationItem.style.display = "block" // bring the loader back again with (display: block)
    }

    loadingObserverRef.current = new MutationObserver(
      (mutations, observerInstance) => {
        const newVideosCount: number = document.querySelectorAll(
          "ytd-rich-item-renderer:not([data-date-processed])"
        ).length

        // as soon as, the now videos has been loaded
        if (newVideosCount) {
          observerInstance.disconnect() // so, we don't need this observer
          loadingObserverRef.current = null
          disableInfiniteScrollObserver()
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
