import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

const PlasmoOverlay = () => {
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<MutationObserver | null>(null)

  // دالة البحث عن عنصر التحميل الخاص بيوتيوب وإخفائه
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

  // تشغيل المراقب (MutationObserver)
  const startObserver = () => {
    if (observerRef.current) return

    disableInfiniteScroll() // إخفاء مبدئي

    observerRef.current = new MutationObserver(() => {
      disableInfiniteScroll()
    })

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // إيقاف المراقب مؤقتاً
  const stopObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }

  useEffect(() => {
    // تشغيل الراقص أول ما الصفحة تفتح
    startObserver()
    return () => stopObserver()
  }, [])

  // دالة المحاكاة عند الضغط على الزر
  const handleLoadMore = () => {
    if (isLoading) return
    setIsLoading(true)

    // 1. وقف المراقبة فوراً وسيب يوتيوب يتنفس
    stopObserver()

    // 2. ابحث عن الـ Loader ورجعه للظهور علشان يوتيوب يحس بيه
    const continuationItem = document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
    ) as HTMLElement

    if (continuationItem) {
      continuationItem.style.display = "block"

      // 3. سكرول بسيط جداً لتحريك العنصر جوه الشاشة ليراه يوتيوب
      window.scrollBy({ top: 10, behavior: "smooth" })
    }

    // 4. مهلة بسيطة (ثانية واحدة) يوتيوب يلحق يبعت الـ Request، وبعدها نرجع نقفل الحنفية تاني
    setTimeout(() => {
      startObserver()
      setIsLoading(false)
    }, 1200)
  }

  return (
    <button
      className={`custom-trigger-btn ${isLoading ? "loading" : ""}`}
      onClick={handleLoadMore}
      disabled={isLoading}>
      {isLoading ? "Loading..." : "Load More Videos 🚀"}
    </button>
  )
}

export default PlasmoOverlay
