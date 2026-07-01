import type { PlasmoCSConfig } from "plasmo"

import "./../style.scss"

import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions"]
}

const isArabic = document.documentElement.lang?.startsWith("ar")
const formatter = new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-UK", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric"
})

// Fetch the video page source code and extract the clean ISO date using RegExp
async function fetchVideoExactISO(videoId: string | null): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    const text = await response.text()

    // RegExp pattern to extract the exact publication date meta tag
    const match: RegExpMatchArray = text.match(
      /<meta itemprop="datePublished" content="([^"]+)">/
    )

    if (match) return match?.[1] ?? null
    return null
  } catch (e) {
    console.error(
      `[YouTube Extension] Error fetching video ISO for ID ${videoId}:`,
      e
    )
    return null
  }
}
// 📦 Helper function to split the detected video cards into smaller groups (batches)
function createBatches(
  cardsArray: HTMLElement[],
  batchSize: number
): HTMLElement[][] {
  const allBatches: HTMLElement[][] = []
  let currentBatch: HTMLElement[] = []

  for (const card of cardsArray) {
    currentBatch.push(card)

    // Once the current batch reaches the specified size (5 for example), push it and reset
    if (currentBatch.length === batchSize) {
      allBatches.push(currentBatch)
      currentBatch = []
    }
  }

  // Push any remaining cards that didn't fill the last batch completely
  if (currentBatch.length > 0) allBatches.push(currentBatch)

  return allBatches
}

export async function processVideosDates() {
  const cards = document.querySelectorAll<HTMLElement>(
    "ytd-rich-item-renderer:not([data-date-processed])"
  )

  const cardsArray = Array.from(cards).filter((card) =>
    card.querySelector("a.ytLockupMetadataViewModelTitle")
  ) as HTMLElement[]
  if (!cardsArray.length) return

  // Split the filtered cards into smaller batches, with a size of 5 cards per batch.
  const videoBatches = createBatches(cardsArray, 5)

  // for (const batch of videoBatches) {
  const promises = cardsArray.map(async (card) => {
    const anchor = card.querySelector(
      "a.ytLockupMetadataViewModelTitle"
    ) as HTMLAnchorElement | null

    const dateSpan = card.querySelector(
      "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
    ) as HTMLSpanElement

    const url = new URL(anchor.href)
    const videoId = url.searchParams.get("v")

    if (videoId) {
      const cachedISO = await storage.get<string>(videoId)
      let exactDateISO = cachedISO

      if (!cachedISO) {
        exactDateISO = await fetchVideoExactISO(videoId)
        if (exactDateISO) storage.set(videoId, exactDateISO)
      }

      if (exactDateISO) {
        const videoDate = new Date(exactDateISO)
        dateSpan.innerText = formatter.format(videoDate)
      }
    }
    card.dataset.dateProcessed = "true"
  })
  await Promise.all(promises)
  // }
}

// 🌐 Function to start observation temporarily and disconnect automatically to save CPU performance
export function triggerDateProcessor() {
  const observer = new MutationObserver((mutations, observerInstance) => {
    // Select only new cards that have not been processed yet
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(
        "ytd-rich-item-renderer:not([data-date-processed])"
      )
    ).filter((card) => card.querySelector("a.ytLockupMetadataViewModelTitle"))

    if (cards.length) {
      window.dispatchEvent(new CustomEvent("youtube-date-sorting-started"))
      // Execute the video processing function in parallel
      processVideosDates()
      // 🎯 Disconnect immediately after finding new cards so it doesn't run forever
      observerInstance.disconnect()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// 🚀 Execute the observer automatically for the initial batch of videos when the page loads

window.dispatchEvent(new CustomEvent("youtube-date-sorting-started"))
processVideosDates().then(() => {
  triggerDateProcessor()
})
