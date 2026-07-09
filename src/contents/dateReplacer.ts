import type { PlasmoCSConfig } from "plasmo"

import "./../style.scss"

import { Storage } from "@plasmohq/storage"

import { toIntlOptions, type DateFormat } from "~helpers/dateFormat"

import { getPageSelectors } from "../helpers/getSelectors"

const storage = new Storage({ area: "local" })

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

async function createFormatter(): Promise<Intl.DateTimeFormat> {
  const savedSettings = await storage.get<DateFormat>("dateFormat")

  const dateFormat: DateFormat = {
    dateType: savedSettings?.dateType || "gregorian",
    weekday: savedSettings?.weekday || "long",
    day: savedSettings?.day || "numeric",
    month: savedSettings?.month || "long",
    year: savedSettings?.year || "numeric"
  }

  const isArabic = document.documentElement.lang?.startsWith("ar")
  return new Intl.DateTimeFormat(
    isArabic ? "ar-EG" : "en-GB",
    toIntlOptions(dateFormat)
  )
}

// Fetch the video page source code and extract the clean ISO date using RegExp
async function fetchVideoExactISO(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    const text = await response.text()

    const match: RegExpMatchArray | null = text.match(
      /<meta itemprop="datePublished" content="([^"]+)">/
    )

    if (match) return match[1] ?? null
    return null
  } catch (e) {
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
  if (currentBatch.length) allBatches.push(currentBatch)

  return allBatches
}

export async function processVideosDates(convertCase = "initial") {
  const selectors = getPageSelectors()
  const newCards = document.querySelectorAll<HTMLElement>(selectors.card)

  const cardsArray = Array.from(newCards).filter((card) => {
    const anchor = card.querySelector<HTMLAnchorElement>(selectors.anchor)
    const span = card.querySelector<HTMLSpanElement>(selectors.dateSpan)
    if (!anchor || !span) return false
    if (convertCase === "update") return card.dataset.dateProcessedFor

    const videoId = new URL(anchor.href).searchParams.get("v")

    return (
      card.dataset.dateProcessedFor !== videoId ||
      (span.innerText.match(/\d/g) || []).length <= 2
    )
  }) as HTMLElement[]

  if (!cardsArray.length) return

  const dynamicFormatter = await createFormatter()

  // Split the filtered cards into smaller batches, with a size of 5 cards per batch.
  const videoBatches = createBatches(cardsArray, 5)

  for (const batch of videoBatches) {
    const promises = batch.map(async (card) => {
      const anchor = card.querySelector<HTMLAnchorElement>(selectors.anchor)
      if (!anchor) return

      const dateSpans = card.querySelectorAll(selectors.dateSpan)
      const dateSpan = dateSpans[dateSpans.length - 1] as HTMLSpanElement

      const videoId = new URL(anchor.href).searchParams.get("v")
      if (!videoId) return

      const cachedISO = await storage.get<string>(videoId)
      let exactDateISO = cachedISO

      if (!cachedISO) {
        exactDateISO = await fetchVideoExactISO(videoId)
        if (exactDateISO) storage.set(videoId, exactDateISO)
      }

      if (exactDateISO) {
        const formattedDate = dynamicFormatter.format(new Date(exactDateISO))
        card.dataset.dateProcessedFor = videoId
        if (dateSpan.innerText === formattedDate) return
        dateSpan.innerText = formattedDate
      }
    })
    await Promise.all(promises)
  }
}

// Let's debounce processing Videos Dates:
let debounceTimer: any = null
let isProcessing = false
let activeObserver: MutationObserver | null = null

export function triggerDateProcessor() {
  processVideosDates()

  if (activeObserver) return activeObserver
  activeObserver = new MutationObserver((mutations) => {
    const hasNewNodes = mutations.some((mutation) => mutation.addedNodes.length)
    if (!hasNewNodes) return

    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(async () => {
      if (isProcessing) return

      const selectors = getPageSelectors()
      const unprocessedCards = document.querySelectorAll<HTMLElement>(
        selectors.card
      )

      const cardsArray = Array.from(unprocessedCards).filter(
        (card) =>
          card.querySelector(selectors.anchor) &&
          card.querySelector(selectors.dateSpan)
      ) as HTMLElement[]

      if (cardsArray.length) {
        try {
          isProcessing = true
          await processVideosDates()
        } finally {
          isProcessing = false
        }
      }
    }, 300)
  })

  activeObserver.observe(document.body, { childList: true, subtree: true })
  return activeObserver
}

// page data is applied to the DOM — now actually process the content
// window.addEventListener("yt-page-data-updated", triggerDateProcessor)

// 🚀 Execute the observer automatically for the initial batch of videos when the page loads
triggerDateProcessor()

// 🚀 مراقبة التغييرات في الـ Storage وتحديث الصفحة فوراً
storage.watch({
  dateFormat: () => {
    processVideosDates("update")
  }
})
