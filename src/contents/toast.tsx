import cssText from "data-text:~/style.scss"
import sonnerStyles from "data-text:sonner/dist/styles.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { toast as toaster, Toaster } from "sonner"

import { useInfiniteScrollBlocker } from "~hooks/useInfiniteScrollBlocker"

import { processVideoCards } from "./dateReplacer"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = `${cssText}\n${sonnerStyles}`
  return styleElement
}

export default function toast() {
  //   useEffect(() => {
  //     const myPromise = () =>
  //       new Promise((resolve) =>
  //         setTimeout(() => resolve({ success: true }), 2000)
  //       )

  //     const timer = setTimeout(() => {
  //       toaster.promise(myPromise, {
  //         loading: "جاري جلب الفيديوهات وترتيبها...",
  //         success: "تم ترتيب الاشتراكات بنجاح!",
  //         error: "عذراً، تعذر الترتيب الآن."
  //       })
  //     }, 400)

  //     return () => clearTimeout(timer)
  //   }, [])

  const { isLoading, loadingText, loadMoreText, handleLoadMore } =
    useInfiniteScrollBlocker()

  useEffect(() => {
    const timer = setTimeout(() => {
      toaster.promise(processVideoCards, {
        loading: "جاري إعادة ترتيب الفيديوهات حسب التاريخ...",
        success: "تم ترتيب صفحة الاشتراكات بنجاح!",
        error: "عذراً، حدث خطأ أثناء الترتيب."
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [isLoading])

  return (
    <Toaster
      position="bottom-right"
      theme="system"
      richColors
      dir="rtl"
      toastOptions={{
        style: {
          padding: "14px 16px",
          borderRadius: "12px",
          fontSize: "16px",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minWidth: "320px",
          gap: "10px"
        }
      }}
    />
  )
}
