import type { PlasmoCSConfig } from "plasmo"

import "./../style.scss"

import { Storage } from "@plasmohq/storage"

import {
  DATE_FORMAT_STORAGE_KEY,
  DEFAULT_DATE_FORMAT_CONFIG,
  dateFormatStorage,
  toIntlOptions,
  type DateFormatConfig
} from "../helpers/dateFormat"
import { getPageSelectors } from "../helpers/getSelectors"

const storage = new Storage({ area: "local" })

export const config: PlasmoCSConfig = { matches: ["https://*.youtube.com/*"] }

const isArabic = document.documentElement.lang?.startsWith("ar")
const locale = isArabic ? "ar-EG" : "en-UK"

// Rebuilt whenever the popup's choice changes (see the storage.watch below),
// so it always mirrors the format selected in the popup instead of a
// hardcoded one.
let formatter = new Intl.DateTimeFormat(
  locale,
  toIntlOptions(DEFAULT_DATE_FORMAT_CONFIG)
)

async function loadFormatConfig(): Promise<DateFormatConfig> {
  const [dateType, weekday, day, month, year] = await Promise.all([
    dateFormatStorage.get(`${DATE_FORMAT_STORAGE_KEY}.dateType`),
    dateFormatStorage.get(`${DATE_FORMAT_STORAGE_KEY}.weekday`),
    dateFormatStorage.get(`${DATE_FORMAT_STORAGE_KEY}.day`),
    dateFormatStorage.get(`${DATE_FORMAT_STORAGE_KEY}.month`),
    dateFormatStorage.get(`${DATE_FORMAT_STORAGE_KEY}.year`)
  ])

  return {
    dateType: dateType ?? DEFAULT_DATE_FORMAT_CONFIG.dateType,
    weekday: weekday ?? DEFAULT_DATE_FORMAT_CONFIG.weekday,
    day: day ?? DEFAULT_DATE_FORMAT_CONFIG.day,
    month: month ?? DEFAULT_DATE_FORMAT_CONFIG.month,
    year: year ?? DEFAULT_DATE_FORMAT_CONFIG.year
  } as DateFormatConfig
}

async function refreshFormatter() {
  const formatConfig = await loadFormatConfig()
  formatter = new Intl.DateTimeFormat(locale, toIntlOptions(formatConfig))
}

// Re-render already-processed cards with the newly chosen format instead of
// waiting for the next mutation/navigation to touch them.
function reformatVisibleCards() {
  const selectors = getPageSelectors()
  document.querySelectorAll<HTMLElement>(selectors.card).forEach((card) => {
    const anchor = card.querySelector<HTMLAnchorElement>(selectors.anchor)
    if (!anchor) return

    const videoId = new URL(anchor.href).searchParams.get("v")
    if (!videoId) return

    storage.get<string>(videoId).then((exactDateISO) => {
      if (!exactDateISO) return
      const dateSpans = card.querySelectorAll(selectors.dateSpan)
      const dateSpan = dateSpans[dateSpans.length - 1] as HTMLSpanElement
      if (!dateSpan) return
      dateSpan.innerText = formatter.format(new Date(exactDateISO))
    })
  })
}

// The popup and this content script run in separate JS contexts — storage
// is the only channel between them, so watch for the popup's choice changing.
dateFormatStorage.watch({
  [`${DATE_FORMAT_STORAGE_KEY}.dateType`]: async () => {
    await refreshFormatter()
    reformatVisibleCards()
  },
  [`${DATE_FORMAT_STORAGE_KEY}.weekday`]: async () => {
    await refreshFormatter()
    reformatVisibleCards()
  },
  [`${DATE_FORMAT_STORAGE_KEY}.day`]: async () => {
    await refreshFormatter()
    reformatVisibleCards()
  },
  [`${DATE_FORMAT_STORAGE_KEY}.month`]: async () => {
    await refreshFormatter()
    reformatVisibleCards()
  },
  [`${DATE_FORMAT_STORAGE_KEY}.year`]: async () => {
    await refreshFormatter()
    reformatVisibleCards()
  }
})

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

  const cardsArray = Array.from(newCards).filter((card) => {
    const anchor = card.querySelector<HTMLAnchorElement>(selectors.anchor)
    const span = card.querySelector<HTMLSpanElement>(selectors.dateSpan)
    if (!anchor || !span) return false

    // const videoId = new URL(anchor.href).searchParams.get("v")
    // return (
    //   card.dataset.dateProcessedFor !== videoId ||
    //   (span.innerText.match(/\d/g) || []).length === 1
    // )
    return (span.innerText.match(/\d/g) || []).length <= 2
  }) as HTMLElement[]

  if (!cardsArray.length) return

  // Split the filtered cards into smaller batches, with a size of 5 cards per batch.
  const videoBatches = createBatches(cardsArray, 5)

  for (const batch of videoBatches) {
    const promises = batch.map(async (card) => {
      const anchor = card.querySelector<HTMLAnchorElement>(selectors.anchor)

      const dateSpans = card.querySelectorAll(selectors.dateSpan)
      const dateSpan = dateSpans[dateSpans.length - 1] as HTMLSpanElement

      const videoId = new URL(anchor.href).searchParams.get("v")

      const cachedISO = await storage.get<string>(videoId)
      let exactDateISO = cachedISO

      if (!cachedISO) {
        exactDateISO = await fetchVideoExactISO(videoId)
        if (exactDateISO) storage.set(videoId, exactDateISO)
      }

      if (exactDateISO) {
        const formattedDate = formatter.format(new Date(exactDateISO))
        // card.dataset.dateProcessedFor = videoId
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

// const clearProcessedFlags = () => {
//   document.querySelectorAll("[data-date-processed-for]").forEach((card) => {
//     delete (card as HTMLElement).dataset.dateProcessedFor
//   })
// }

// navigation starts — clear stale flags so new content gets processed
// window.addEventListener("yt-navigate-finish", clearProcessedFlags)

// page data is applied to the DOM — now actually process the content
window.addEventListener("yt-page-data-updated", triggerDateProcessor)

// Wait for the stored format to load before the very first render, so the
// initial batch doesn't flash the default format and get stuck that way
// (storage.watch above only fires on subsequent changes, not on load).
refreshFormatter().then(triggerDateProcessor)
