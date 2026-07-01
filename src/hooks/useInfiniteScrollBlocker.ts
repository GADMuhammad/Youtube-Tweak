import { useEffect, useRef, useState } from "react"

import { triggerDateProcessor } from "~contents/dateReplacer"
import { loadingButton } from "~helpers/translationObject"

export const useInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false)
  const infiniteScrollObserverRef = useRef<MutationObserver | null>(null)
  const loadingObserverRef = useRef<MutationObserver | null>(null)
  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadMoreText } = loadingButton[currentLang]

  // 🎯 دالة مساعدة لمعرفة هل المستخدم في صفحة البحث حالياً
  const isSearchPage = () => window.location.pathname === "/results"

  // 🎯 تحديد العنصر المسبب للـ infinite scroll بناءً على الصفحة
  const getContinuationItem = (): HTMLElement | null => {
    if (isSearchPage()) {
      return document.querySelector("ytd-search ytd-continuation-item-renderer")
    } else {
      return document.querySelector(
        "ytd-rich-grid-renderer ytd-continuation-item-renderer"
      )
    }
  }

  // 🎯 تحديد الـ Selector الخاص بالفيديوهات الجديدة بناءً على الصفحة
  const getNewVideosSelector = () => {
    if (isSearchPage()) {
      return {
        item: "ytd-video-renderer:not([data-date-processed])",
        title: "a#video-title"
      }
    } else {
      return {
        item: "ytd-rich-item-renderer:not([data-date-processed])",
        title: "a.ytLockupMetadataViewModelTitle"
      }
    }
  }

  const disableInfiniteScroll = () => {
    const continuationItem = getContinuationItem()
    if (continuationItem && continuationItem.style.display !== "none") {
      continuationItem.style.display = "none"
    }
  }

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

  const stopObserver = () => {
    if (infiniteScrollObserverRef.current) {
      infiniteScrollObserverRef.current.disconnect()
      infiniteScrollObserverRef.current = null
    }
  }

  useEffect(() => {
    disableInfiniteScrollObserver()

    return () => {
      stopObserver()
      if (loadingObserverRef.current) {
        loadingObserverRef.current.disconnect()
        loadingObserverRef.current = null
      }
    }
  }, [])

  const handleLoadMore = () => {
    if (isLoading) return
    setIsLoading(true)

    triggerDateProcessor()
    stopObserver()

    const continuationItem = getContinuationItem()
    if (continuationItem) {
      continuationItem.style.display = "block"
    }

    const selectors = getNewVideosSelector()

    loadingObserverRef.current = new MutationObserver(
      (mutations, observerInstance) => {
        const newVideos = Array.from(
          document.querySelectorAll(selectors.item)
        ).filter((card) => card.querySelector(selectors.title))

        if (newVideos.length) {
          observerInstance.disconnect()
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
