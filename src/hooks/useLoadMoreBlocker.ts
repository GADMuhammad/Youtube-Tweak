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

    if (!continuationItem && itemCount) setSituation("NoMore")
    else if (!continuationItem && !itemCount) setSituation("None")
    else if (blockWhenEmpty || itemCount) setSituation("Normal")

    // Hiding is a one-off side effect, kept independent of the situation
    // above: on SPA navigation YouTube can reuse the same continuation node
    // (still carrying the display:none we set for the *previous* page), so
    // gating "Normal" on this would leave situation stuck from before.
    // !important because every continuation item is also targeted by a
    // static CSS rule (see hideLoadMoreTrigger.ts) that hides it before
    // this code ever runs — a plain inline style here doesn't need to win
    // against that rule, but setting it with the same priority keeps this
    // one source of truth regardless of which one actually applied it.
    if (continuationItem && continuationItem.style.display !== "none") {
      continuationItem.style.setProperty("display", "none", "important")
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

    // YouTube can reuse the same container across SPA navigations instead of
    // remounting it (see useCommentsInfiniteScrollBlocker.ts), so `situation`
    // would otherwise stay latched to the outgoing page's value — e.g. still
    // "NoMore" on a new video that actually has comments. Reset to "Normal"
    // rather than re-running updateSituation() here: the incoming page's DOM
    // (new item count, new continuation item) usually hasn't landed yet at
    // this exact event, so evaluating immediately just re-derives the old
    // page's stale answer. The still-active block observer below picks up
    // the real state once the new page's content actually mutates the DOM.
    const handleNavigate = () => {
      setIsLoading(false)
      if (loadingObserverRef.current) {
        loadingObserverRef.current.disconnect()
        loadingObserverRef.current = null
      }
      setSituation("Normal")
    }
    window.addEventListener("yt-navigate-finish", handleNavigate)

    return () => {
      window.removeEventListener("yt-navigate-finish", handleNavigate)
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

    // !important to override the static CSS hide rule
    // (hideLoadMoreTrigger.ts) — a non-important inline value can't win
    // against an !important stylesheet rule.
    continuationItem.style.setProperty("display", "block", "important")

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
