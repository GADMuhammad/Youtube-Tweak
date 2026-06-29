import type { PlasmoCSConfig } from "plasmo"

import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions"]
}

// Fetch the video page source code and extract the clean ISO date using RegExp
async function fetchVideoExactISO(videoId: string): Promise<string> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    const text = await response.text()

    // RegExp pattern to extract the exact publication date meta tag
    const match: RegExpMatchArray = text.match(
      /<meta itemprop="datePublished" content="([^"]+)">/
    )

    return match?.[1] ?? null

    // if (match) return match // Returns clean ISO string (e.g., 2026-06-24T13:00:04.000Z)
    return null
  } catch (e) {
    console.error(
      `[YouTube Extension] Error fetching video ISO for ID ${videoId}:`,
      e
    )
    return null
  }
}

export async function processVideosDates() {
  const cards = document.querySelectorAll(
    "ytd-rich-item-renderer:not([data-date-processed])"
  )
  if (!cards.length) return

  const cardsArray = Array.from(cards).filter((card) =>
    card.querySelector("a.ytLockupMetadataViewModelTitle")
  )

  const promises = cardsArray.map(async (card) => {
    const htmlCard = card as HTMLElement

    const anchor = htmlCard.querySelector(
      "a.ytLockupMetadataViewModelTitle"
    ) as HTMLAnchorElement | null

    const span = htmlCard.querySelector(
      "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label]"
    )
    const dateSpan = span as HTMLSpanElement | null

    const videoName = htmlCard.querySelector(
      "span[role='text'].ytAttributedStringHost.ytAttributedStringWhiteSpacePreWrap"
    ) as HTMLSpanElement
    console.log(videoName)
    console.log(anchor.getAttribute("href"))

    // console.log("INSIDE promises")
    // console.log(anchor, dateSpan)
    // if (dateSpan) {
    const href = anchor.getAttribute("href") || ""
    const urlParams = new URLSearchParams(href.split("?")[1])
    const videoId = urlParams.get("v")
    // console.log("INSIDE &if")
    // console.log(videoId)

    if (videoId) {
      const cachedISO = await storage.get<string>(videoId)
      let exactDateISO = cachedISO

      if (!cachedISO) {
        exactDateISO = await fetchVideoExactISO(videoId)
        if (exactDateISO) storage.set(videoId, exactDateISO)
      }

      if (exactDateISO) {
        const videoDate = new Date(exactDateISO)
        const isArabic = document.documentElement.lang?.startsWith("ar")
        const formattedDate = videoDate.toLocaleDateString(
          isArabic ? "ar-EG" : "en-UK",
          {
            weekday: "short",
            day: "numeric",
            month: "short"
          }
        )

        dateSpan.innerText = formattedDate
      }
    }
    htmlCard.setAttribute("data-date-processed", "true")
    // }
  })
  await Promise.all(promises)
}

// 🌐 Function to start observation temporarily and disconnect automatically to save CPU performance
export function triggerDateProcessor() {
  const observer = new MutationObserver((mutations, observerInstance) => {
    // Select only new cards that have not been processed yet
    const cards = document.querySelectorAll(
      "ytd-rich-item-renderer:not([data-date-processed])"
    )

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
