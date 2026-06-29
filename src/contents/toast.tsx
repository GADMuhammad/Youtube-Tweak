import cssText from "data-text:~/style.scss"
import sonnerStyles from "data-text:sonner/dist/styles.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { toast as toaster, Toaster } from "sonner"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = `${cssText}\n${sonnerStyles}`
  return styleElement
}

// const cards = document.querySelectorAll(
//   "ytd-rich-item-renderer:not([data-date-processed])"
// )

export default function toast() {
  useEffect(() => {
    const timer = setTimeout(() => {
      toaster("Learn more page was not included in the design provided !")
    }, 400)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Toaster
      position="top-center"
      theme="system"
      richColors
      toastOptions={{
        style: {
          padding: "14px 16px",
          borderRadius: "10px",
          fontSize: "14px",
          fontFamily: "system-ui, sans-serif",
          minWidth: "300px",
          zIndex: "9999"
        },
        className: "my-custom-toast-layout"
      }}
    />
  )
}
