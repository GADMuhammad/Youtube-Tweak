import type { PlasmoCSConfig } from "plasmo"

import { triggerDateProcessor } from "./dateReplacer"

export const config: PlasmoCSConfig = {
  matches: ["https://*.youtube.com/*"]
}
console.log("[SPA] loaded")
// دالة لتشغيل كل ميزات الإضافة اللي محتاجة تتحدث مع كل نقلة
const runGlobalFeatures = () => {
  document.querySelectorAll("[data-date-processed]").forEach((card) => {
    delete (card as HTMLElement).dataset.dateProcessed
  })

  triggerDateProcessor()
}

window.addEventListener("yt-navigate-finish", () => {
  console.log("[SPA] yt-navigate-finish", location.href)
  runGlobalFeatures()
})
