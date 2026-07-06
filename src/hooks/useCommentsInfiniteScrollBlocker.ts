import { useEffect, useRef, useState } from "react"

import { getCommentsContinuationItem } from "~helpers/getSelectors"
import { loadingCommentsButton } from "~helpers/translationObject"

export const useCommentsInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [hasComments, setHasComments] = useState(
    () =>
      document.querySelectorAll("ytd-comments#comments ytd-comment-thread-renderer")
        .length > 0
  )
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

    const continuationItem = getCommentsContinuationItem()
    if (!continuationItem) {
      setHasMore(false)
      return
    }

    const threadCountBefore = document.querySelectorAll(
      "ytd-comments#comments ytd-comment-thread-renderer"
    ).length

    setIsLoading(true)
    stopBlocking()

    continuationItem.style.display = "block"

    loadingObserverRef.current = new MutationObserver((_, observerInstance) => {
      const stopLoading = () => {
        observerInstance.disconnect()
        loadingObserverRef.current = null
        setIsLoading(false)
      }

      const threadCountAfter = document.querySelectorAll(
        "ytd-comments#comments ytd-comment-thread-renderer"
      ).length

      if (threadCountAfter > threadCountBefore) {
        stopLoading()
        setHasComments(true)
        startBlocking()
      } else if (!getCommentsContinuationItem()) {
        stopLoading()
        setHasMore(false)
      }
    })

    loadingObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  return { isLoading, hasMore, loadingText, buttonText, handleLoadMore }
}
