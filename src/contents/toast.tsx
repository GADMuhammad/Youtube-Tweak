import cssText from "data-text:~/style.scss"
import sonnerStyles from "data-text:sonner/dist/styles.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { toast as toaster, Toaster } from "sonner"

import { toastText } from "~helpers/translationObject"

import { processVideosDates } from "./dateReplacer"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = `${cssText}\n${sonnerStyles}`
  return styleElement
}
const isArabic = document.documentElement.lang?.startsWith("ar")
const currentLanguage = isArabic ? "ar" : "en"
const { loading, success, error } = toastText[currentLanguage]

export default function toast() {
  useEffect(() => {
    const handleSortingSignal = () => {
      toaster.promise(processVideosDates, { loading, success, error })
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
      position={isArabic ? "bottom-right" : "bottom-left"}
      theme="system"
      richColors
      dir={isArabic ? "rtl" : "ltr"}
      toastOptions={{
        style: {
          padding: "14px 16px",
          borderRadius: "12px",
          fontSize: "16px",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minWidth: "330px",
          gap: "10px",
          whiteSpace: "nowrap"
        }
      }}
    />
  )
}
