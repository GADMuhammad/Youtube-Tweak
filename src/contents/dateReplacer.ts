import type { PlasmoCSConfig } from "plasmo"

import "./../style.scss"

import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

export const config: PlasmoCSConfig = {
  matches: ["https://*.youtube.com/*"]
}

const isArabic = document.documentElement.lang?.startsWith("ar")
const formatter = new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-UK", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric"
})

const isSearchPage = () => window.location.pathname === "/results"
const getPageSelectors = () => {
  if (isSearchPage()) {
    return {
      card: "ytd-video-renderer:not([data-date-processed])",
      anchor: "a#video-title",
      dateSpan: "#metadata-line span.inline-metadata-item"
    }
  } else {
    return {
      card: "ytd-rich-item-renderer:not([data-date-processed])",
      anchor: "a.ytLockupMetadataViewModelTitle",
      dateSpan:
        "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
    }
  }
}

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
  const selectors = getPageSelectors()
  const newCards = document.querySelectorAll<HTMLElement>(selectors.card)

  const cardsArray = Array.from(newCards).filter((card) =>
    card.querySelector(selectors.anchor && selectors.dateSpan)
  ) as HTMLElement[]
  if (!cardsArray.length) console.log("empty")
  if (!cardsArray.length) return

  //
  cardsArray.forEach((card) => {
    card.dataset.dateProcessed = "true"
  })

  // Split the filtered cards into smaller batches, with a size of 5 cards per batch.
  const videoBatches = createBatches(cardsArray, 3)

  for (const batch of videoBatches) {
    const promises = batch.map(async (card) => {
      const anchor = card.querySelector(
        selectors.anchor
      ) as HTMLAnchorElement | null

      const dateSpans = card.querySelectorAll(selectors.dateSpan)
      const dateSpan = dateSpans[dateSpans.length - 1] as HTMLSpanElement

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
          if (dateSpan.innerText === formatter.format(videoDate))
            console.log("return")
          if (dateSpan.innerText === formatter.format(videoDate)) return
          dateSpan.innerText = formatter.format(videoDate)
        }
      }
      // card.dataset.dateProcessed = "true"
    })
    await Promise.all(promises)
  }
}

// 🎯 1. التايمر لازم يتعرف بره خالص عشان قيمته تفضل ثابتة بين الاستدعاءات
let debounceTimer: any = null
let isProcessing = false

export function triggerDateProcessor() {
  processVideosDates()
  const observer = new MutationObserver((mutations, mutationsObserver) => {
    // Smart Check: If no new nodes were actually added, return early to optimize CPU performance
    const hasNewNodes = mutations.some((mutation) => mutation.addedNodes.length)
    if (!hasNewNodes) return

    // True Debounce: Cancel the previous timer if the Observer triggers again quickly
    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(async () => {
      if (isProcessing) return

      const selectors = getPageSelectors()
      const unprocessedCards = document.querySelectorAll<HTMLElement>(
        selectors.card
      )
      const cardsArray = Array.from(unprocessedCards).filter((card) =>
        card.querySelector(selectors.anchor && selectors.dateSpan)
      ) as HTMLElement[]

      if (cardsArray.length) {
        try {
          isProcessing = true
          window.dispatchEvent(new CustomEvent("youtube-date-sorting-started"))
          await processVideosDates()
        } finally {
          isProcessing = false
          // if (!cardsArray.length) mutationsObserver.disconnect()
        }
      }
    }, 300)
  })

  observer.observe(document.body, { childList: true, subtree: true })
  return observer
}

// 🚀 Execute the observer automatically for the initial batch of videos when the page loads
window.dispatchEvent(new CustomEvent("youtube-date-sorting-started"))
triggerDateProcessor()
