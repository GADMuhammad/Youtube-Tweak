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
  const newCards = () => document.querySelectorAll<HTMLElement>(selectors.card)

  const cardsArray = Array.from(newCards()).filter((card) =>
    card.querySelector(selectors.anchor)
  ) as HTMLElement[]
  // if (!cardsArray.length) return
  if (!cardsArray.length) console.log("empty")

  // Split the filtered cards into smaller batches, with a size of 5 cards per batch.
  const videoBatches = createBatches(cardsArray, 5)

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
          if (dateSpan.innerText === formatter.format(videoDate)) return
          dateSpan.innerText = formatter.format(videoDate)
        }
      }
      card.dataset.dateProcessed = "true"
    })
    await Promise.all(promises)
  }
}

// 🌐 Function to start observation temporarily and disconnect automatically to save CPU performance
export function triggerDateProcessor() {
  const observer = new MutationObserver((mutations, observerInstance) => {
    // Let's debounce disconncting observer، because Youtube renders videos consecutively (NOT in on shot)
    function debounce(func, delay: number) {
      let timeoutId: ReturnType<typeof setTimeout>

      return function () {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func()
        }, delay)
      }
    }

    // 🎯 Disconnect observer immediately after replacinf new cards dates so it doesn't run forever (to save user RAM, because it can leed to memory leak.)
    const disconnectObserver = debounce(
      () => observerInstance.disconnect(),
      500
    )

    const selectors = getPageSelectors()

    // Select only new cards that have not been processed yet
    const newCards = Array.from(
      document.querySelectorAll<HTMLElement>(selectors.card)
    ).filter((card) => card.querySelector(selectors.anchor))

    // use Debouncing instead:
    if (newCards.length) {
      window.dispatchEvent(new CustomEvent("youtube-date-sorting-started"))
      // Execute the video processing function in parallel
      processVideosDates()
      disconnectObserver()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// 🚀 Execute the observer automatically for the initial batch of videos when the page loads

window.dispatchEvent(new CustomEvent("youtube-date-sorting-started"))
processVideosDates().then(() => {
  triggerDateProcessor()
})
