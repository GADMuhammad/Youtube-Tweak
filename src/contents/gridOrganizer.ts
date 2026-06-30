import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

let globalLastDate = ""
export async function organizeGridSections(batchCards: HTMLElement[]) {
  for (const card of batchCards) {
    const anchor = card.querySelector(
      "a.ytLockupMetadataViewModelTitle"
    ) as HTMLAnchorElement | null
    if (!anchor) continue

    const videoName = card.querySelector(
      "span.ytAttributedStringHost.ytAttributedStringWhiteSpacePreWrap"
    )

    const url = new URL(anchor.href)
    const videoId = url.searchParams.get("v")

    if (!videoId) continue
    card.removeAttribute("is-in-first-column") // a built-in youtube attribute that must be removed

    // get the date from storage in order to be able to sort the video
    const exactDateISO = await storage.get<string>(videoId)
    console.log(exactDateISO)
    if (!exactDateISO) continue

    // const currentDate = exactDateISO.substring(0, 10)
    const videoDateObj = new Date(exactDateISO)
    // const currentDate = videoDateObj.toLocaleDateString("en-CA") // en-CA always outputs in YYYY-MM-DD format
    // const currentDate = videoDateObj.toISOString().substring(0, 10) // Outputs: "2026-06-28" in UTC

    // 🚀 استخراج السنة والشهر واليوم بالتوقيت العالمي الثابت الموحد (UTC)
    const year = videoDateObj.getUTCFullYear()
    const month = String(videoDateObj.getUTCMonth() + 1).padStart(2, "0")
    const day = String(videoDateObj.getUTCDate()).padStart(2, "0")

    const currentDate = `${year}-${month}-${day}` // النتيجة دائماً YYYY-MM-DD بتوقيت UTC الثابت

    // If statement to distribute CSS classes and attributes based on the date
    if (globalLastDate === "") {
      card.dataset["dayFirst"] = "true"
      globalLastDate = currentDate
    } else if (currentDate !== globalLastDate) {
      // New day detected ⬅️ Break the row and align to the first column
      card.dataset["dayFirst"] = "true"
      globalLastDate = currentDate
    }
  }
}
