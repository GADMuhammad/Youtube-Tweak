import { useEffect, useRef, useState } from "react"

import { triggerDateProcessor } from "~contents/dateReplacer"
import getPageSelectors from "~helpers/getPageSelectors"
import { loadingButton } from "~helpers/translationObject"

export const useInfiniteScrollBlocker = () => {
  const [isLoading, setIsLoading] = useState(false)
  const infiniteScrollObserverRef = useRef<MutationObserver | null>(null)
  const loadingObserverRef = useRef<MutationObserver | null>(null)
  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadMoreText } = loadingButton[currentLang]
  const [videosSituation, setVideosSituation] = useState<
    "YES" | "NoMoreVideos" | "NoVideos"
  >("YES")
  const isSearchPage = () => window.location.pathname === "/results"
  const isPlaylistPage = () => window.location.pathname === "/playlist"
  const getContinuationItem = (): HTMLElement | null => {
    if (isSearchPage()) {
      return document.querySelector("ytd-search ytd-continuation-item-renderer")
    }
    if (isPlaylistPage()) {
      return document.querySelector(
        "ytd-playlist-video-list-renderer ytd-continuation-item-renderer"
      )
    }
    return document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer"
    )
  }
  // 🎯 تعديل: جعل الفحص يقرأ السيلكتورز الحالية بدقة لمنع تداخل الكروت المخفية
  function changeVideosSituations() {
    const continuationItem = getContinuationItem()
    const selectors = getPageSelectors()
    const cleanCardSelector = selectors.card.replace(
      ":not([data-date-processed])",
      ""
    )
    const numberOfVideos = document.querySelectorAll(cleanCardSelector).length
    if (!continuationItem && numberOfVideos > 0)
      setVideosSituation("NoMoreVideos")
    if (continuationItem && numberOfVideos > 0) setVideosSituation("YES")
    if (numberOfVideos === 0) setVideosSituation("NoVideos")
  }
  const disableInfiniteScroll = () => {
    const continuationItem = getContinuationItem()
    // نقوم بتحديث الحالة باستمرار مع كل حركة في الـ DOM
    changeVideosSituations()
    if (continuationItem && continuationItem.style.display !== "none") {
      continuationItem.style.display = "none"
    }
  }
  const disableInfiniteScroll_observer = () => {
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
  const reEnableInfiniteScroll = () => {
    if (infiniteScrollObserverRef.current) {
      infiniteScrollObserverRef.current.disconnect()
      infiniteScrollObserverRef.current = null
    }
  }
  useEffect(() => {
    disableInfiniteScroll_observer()
    const resetForNewPage = () => {
      reEnableInfiniteScroll()
      setIsLoading(false)
      // 🎯 إعادة تعيين مبدئي عند الانتقال لتجنب تعليق القيمة القديمة
      setVideosSituation("YES")
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
    if (isLoading) return
    setIsLoading(true)
    triggerDateProcessor()
    reEnableInfiniteScroll()
    const continuationItem = getContinuationItem()
    if (continuationItem) continuationItem.style.display = "block"
    const selectors = getPageSelectors()
    loadingObserverRef.current = new MutationObserver(
      (mutations, observerInstance) => {
        const newVideos = Array.from(
          document.querySelectorAll(selectors.card)
        ).filter((card) => card.querySelector(selectors.anchor))
        const stopLoading = () => {
          observerInstance.disconnect()
          loadingObserverRef.current = null
          setIsLoading(false)
        }
        if (newVideos.length) {
          stopLoading()
          disableInfiniteScroll_observer()
        } else {
          // 🎯 تصليح: الفحص الحي للـ DOM وقت عمل الـ Observer وليس الاعتماد على المتغير القديم
          const currentContinuation = getContinuationItem()
          if (!currentContinuation) {
            stopLoading()
            setVideosSituation("NoMoreVideos")
          }
        }
      }
    )
    loadingObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
  // الـ useEffect الأخير تم دمجه وتحديثه تلقائياً عبر الـ Mutation Observer بالأعلى لضمان التوقيت المزامَن
  return {
    isLoading,
    loadingText,
    loadMoreText,
    handleLoadMore,
    videosSituation
  }
}
