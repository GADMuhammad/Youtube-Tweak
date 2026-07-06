import { useEffect, useRef, useState } from "react"

export type LoadMoreSituation = "Normal" | "NoMore" | "None"

interface UseLoadMoreBlockerParams {
  getContinuationItem: () => HTMLElement | null
  countItems: () => number
  // Whether an empty item count should still be actively blocked while a
  // continuation item is present. Comments: yes — our block also gates the
  // very first batch, so 0 items is the normal starting state. Videos: no —
  // the grid is pre-rendered, so 0 items with a continuation present is just
  // a transient loading state, not something to mark "Normal" yet.
  blockWhenEmpty?: boolean
  // called while the continuation item is revealed, to detect whether the
  // load actually produced new content (vs. still loading)
  hasNewContent: (countBefore: number) => boolean
  // runs right before the continuation item is revealed (e.g. video date processing)
  onReveal?: () => void
  // runs once new content has been detected
  onNewContent?: () => void
}

export const useLoadMoreBlocker = ({
  getContinuationItem,
  countItems,
  blockWhenEmpty = false,
  hasNewContent,
  onReveal,
  onNewContent
}: UseLoadMoreBlockerParams) => {
  const [isLoading, setIsLoading] = useState(false)
  const [situation, setSituation] = useState<LoadMoreSituation>("Normal")
  const blockObserverRef = useRef<MutationObserver | null>(null)
  const loadingObserverRef = useRef<MutationObserver | null>(null)

  const updateSituation = () => {
    const continuationItem = getContinuationItem()
    const itemCount = countItems()

    if (!continuationItem && itemCount > 0) setSituation("NoMore")
    else if (!continuationItem && itemCount === 0) setSituation("None")
    else if (blockWhenEmpty || itemCount > 0) setSituation("Normal")

    // Hiding is a one-off side effect, kept independent of the situation
    // above: on SPA navigation YouTube can reuse the same continuation node
    // (still carrying the display:none we set for the *previous* page), so
    // gating "Normal" on this would leave situation stuck from before.
    if (continuationItem && continuationItem.style.display !== "none") {
      continuationItem.style.display = "none"
    }
  }

  const startBlocking = () => {
    if (blockObserverRef.current) return
    updateSituation()
    blockObserverRef.current = new MutationObserver(updateSituation)
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
    if (isLoading || situation === "NoMore") return

    const continuationItem = getContinuationItem()
    if (!continuationItem) {
      setSituation("NoMore")
      return
    }

    const countBefore = countItems()

    setIsLoading(true)
    onReveal?.()
    stopBlocking()

    continuationItem.style.display = "block"

    loadingObserverRef.current = new MutationObserver((_, observerInstance) => {
      const stopLoading = () => {
        observerInstance.disconnect()
        loadingObserverRef.current = null
        setIsLoading(false)
      }

      if (hasNewContent(countBefore)) {
        stopLoading()
        onNewContent?.()
        startBlocking()
      } else if (!getContinuationItem()) {
        stopLoading()
        setSituation("NoMore")
      }
    })

    loadingObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  return { isLoading, situation, handleLoadMore }
}
