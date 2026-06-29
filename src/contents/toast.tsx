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

export default function toast() {
  useEffect(() => {
    const timer = setTimeout(() => {
      toaster("Learn more page was not included in the design provided !")
    }, 400)

    return () => clearTimeout(timer)
  }, [])

  return <Toaster position="bottom-right" theme="dark" />
}
