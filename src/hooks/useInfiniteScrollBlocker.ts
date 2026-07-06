import { useEffect, useRef, useState } from "react"

import { triggerDateProcessor } from "~contents/dateReplacer"
import { getContinuationItem, getPageSelectors } from "~helpers/getSelectors"
import { loadingButton } from "~helpers/translationObject"

export const useInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [videosSituation, setVideosSituation] = useState<
    "Normal" | "NoMoreVideos" | "NoVideos"
  >("Normal")
  const blockObserverRef = useRef<MutationObserver | null>(null)
  const loadingObserverRef = useRef<MutationObserver | null>(null)

  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadMoreText: buttonText } = loadingButton[currentLang]

  const hideContinuationItem = () => {
    const continuationItem = getContinuationItem()
    const selectors = getPageSelectors()
    const cleanCardSelector = selectors.card.replace(
      ":not([data-date-processed])",
      ""
    )
    const numberOfVideos = document.querySelectorAll(cleanCardSelector).length
    if (!continuationItem && numberOfVideos > 0)
      setVideosSituation("NoMoreVideos")
    if (!numberOfVideos) setVideosSituation("NoVideos")

    if (
      numberOfVideos &&
      continuationItem &&
      continuationItem.style.display !== "none"
    ) {
      continuationItem.style.display = "none"
      setVideosSituation("Normal")
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
    if (isLoading || videosSituation === "NoMoreVideos") return

    const continuationItem = getContinuationItem()
    if (!continuationItem) {
      setVideosSituation("NoMoreVideos")
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
        setVideosSituation("NoMoreVideos")
      }
    })

    loadingObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  return { isLoading, videosSituation, loadingText, buttonText, handleLoadMore }
}
