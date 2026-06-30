import cssText from "data-text:~/style.scss"
import sonnerStyles from "data-text:sonner/dist/styles.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { toast as toaster, Toaster } from "sonner"

import { processVideosDates } from "./dateReplacer"

// import "sonner/dist/styles.css"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = `${cssText}\n${sonnerStyles}`
  return styleElement
}

export default function toast() {
  useEffect(() => {
    const handleSortingSignal = () => {
      toaster.promise(processVideosDates, {
        loading: "جاري إعادة ترتيب الفيديوهات حسب التاريخ...",
        success: "تم ترتيب صفحة الاشتراكات بنجاح!",
        error: "عذراً، حدث خطأ أثناء الترتيب."
      })
    }

    window.addEventListener("youtube-date-sorting-started", handleSortingSignal)

    return () => {
      window.removeEventListener(
        "youtube-date-sorting-started",
        handleSortingSignal
      )
    }
  }, [])

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
