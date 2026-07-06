import { useEffect, useRef, useState } from "react"

import { getCommentsContinuationItem } from "~helpers/getSelectors"
import { loadingCommentsButton } from "~helpers/translationObject"

const countThreads = () =>
  document.querySelectorAll("ytd-comments#comments ytd-comment-thread-renderer")
    .length

export const useCommentsInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [commentsSituation, setCommentsSituation] = useState<
    "Normal" | "NoMoreComments" | "NoComments"
  >("Normal")
  // tracks whether any comment has ever been loaded, purely to pick the
  // button label ("Load Comments" vs "Load More Comments") — unlike videos,
  // our block also gates the very first batch, so 0 threads is the normal
  // starting state, not an empty-page signal.
  const [hasComments, setHasComments] = useState(() => countThreads() > 0)
  const blockObserverRef = useRef<MutationObserver | null>(null)
  const loadingObserverRef = useRef<MutationObserver | null>(null)

  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadText, loadMoreText } =
    loadingCommentsButton[currentLang]
  const buttonText = hasComments ? loadMoreText : loadText

  const hideContinuationItem = () => {
    const continuationItem = getCommentsContinuationItem()
    const threadCount = countThreads()

    if (!continuationItem && threadCount > 0)
      setCommentsSituation("NoMoreComments")
    if (!continuationItem && threadCount === 0)
      setCommentsSituation("NoComments")

    if (continuationItem && continuationItem.style.display !== "none") {
      continuationItem.style.display = "none"
      setCommentsSituation("Normal")
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
    if (isLoading || commentsSituation === "NoMoreComments") return

    const continuationItem = getCommentsContinuationItem()
    if (!continuationItem) {
      setCommentsSituation("NoMoreComments")
      return
    }

    const threadCountBefore = countThreads()

    setIsLoading(true)
    stopBlocking()

    continuationItem.style.display = "block"

    loadingObserverRef.current = new MutationObserver((_, observerInstance) => {
      const stopLoading = () => {
        observerInstance.disconnect()
        loadingObserverRef.current = null
        setIsLoading(false)
      }

      const threadCountAfter = countThreads()

      if (threadCountAfter > threadCountBefore) {
        stopLoading()
        setHasComments(true)
        startBlocking()
      } else if (!getCommentsContinuationItem()) {
        stopLoading()
        setCommentsSituation("NoMoreComments")
      }
    })

    loadingObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  return {
    isLoading,
    commentsSituation,
    loadingText,
    buttonText,
    handleLoadMore
  }
}
