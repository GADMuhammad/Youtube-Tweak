import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

const isArabic = document.documentElement.lang?.startsWith("ar")
const formatter = new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-UK", {
  weekday: "short",
  day: "numeric",
  month: "short"
})

let globalLastDate: Date | string = ""
export async function organizeGridSections(batchCards: HTMLElement[]) {
  for (const card of batchCards) {
    const anchor = card.querySelector(
      "a.ytLockupMetadataViewModelTitle"
    ) as HTMLAnchorElement | null
    if (!anchor) console.log("no anchor")

    const url = new URL(anchor.href)
    const videoId = url.searchParams.get("v")

    if (!videoId) console.log("no id")
    card.removeAttribute("is-in-first-column") // a built-in youtube attribute that must be removed

    // get the date from storage in order to be able to sort the video
    const exactDateISO = await storage.get<string>(videoId)
    if (!exactDateISO) continue

    const videoDateObj = new Date(exactDateISO)
    const currentDate = formatter.format(videoDateObj)

    // If statement to distribute CSS classes and attributes based on the date
    if (globalLastDate === "") {
      card.dataset.dayFirst = "true"
      globalLastDate = currentDate
    } else if (currentDate !== globalLastDate) {
      const breaker = document.createElement("div")
      breaker.className = "day-breaker"
      card.parentNode?.insertBefore(breaker, card)
      // New day detected ⬅️ Break the row and align to the first column
      card.dataset.dayFirst = "true"
      globalLastDate = currentDate
    }
  }
}
