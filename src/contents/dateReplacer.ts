import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"

import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions"]
}

// 3️⃣ Step 3: Fetch the video page source code and extract the clean ISO date using RegExp
async function fetchVideoExactISO(videoId: string): Promise<RegExpMatchArray> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    const text = await response.text()

    // RegExp pattern to extract the exact publication date meta tag
    const match: RegExpMatchArray = text.match(
      /<meta itemprop="datePublished" content="([^"]+)">/
    )
    if (match) return match // Returns clean ISO string (e.g., 2026-06-24T13:00:04.000Z)
    return null
  } catch (e) {
    console.error(
      `[YouTube Extension] Error fetching video ISO for ID ${videoId}:`,
      e
    )
    return null
  }
}

async function processVideoCards() {
  const cards = document.querySelectorAll("ytd-rich-item-renderer")
  if (!cards.length) return
  console.log(`[YouTube Extension]${cards.length} ...`)

  const cardsArray = Array.from(cards)
  const promises = cardsArray.map(async (card) => {
    const htmlCard = card as HTMLElement

    const anchor = htmlCard.querySelector(
      "a.ytLockupMetadataViewModelTitle"
    ) as HTMLAnchorElement | null

    const spans = htmlCard.querySelector(
      "div.ytContentMetadataViewModelMetadataRow span[role='text'][aria-label].ytAttributedStringHost.ytContentMetadataViewModelMetadataText.ytAttributedStringWhiteSpacePreWrap.ytAttributedStringLinkInheritColor"
    )
    const dateSpan = spans as HTMLSpanElement | null

    if (anchor && dateSpan) {
      const href = anchor.getAttribute("href") || ""
      const urlParams = new URLSearchParams(href.split("?")[1])
      const videoId = urlParams.get("v")

      if (videoId) {
        const cachedISO = await storage.get<RegExpMatchArray>(videoId)
        let exactDateISO = cachedISO

        if (cachedISO) {
          // console.log("⚡ Found in cache:", videoId)
        } else {
          // console.log("🌐 Fetching from network:", videoId)
          exactDateISO = await fetchVideoExactISO(videoId)
          if (exactDateISO) await storage.set(videoId, exactDateISO)
        }

        if (exactDateISO) {
          // console.log(exactDateISO[0].match(/content="([^"]+)"/)[1])
          const videoDate = new Date(
            exactDateISO[0].match(/content="([^"]+)"/)[1]
          )
          const formattedDate = videoDate.toLocaleDateString("en-UK", {
            weekday: "short",
            day: "numeric",
            month: "short"
          })

          dateSpan.innerText = formattedDate
        }
      }
      htmlCard.setAttribute("data-date-processed", "true")
    }
  })
  await Promise.all(promises)
  // console.log("🎯 All 40 videos processed in parallel!")
}

// 🌐 Function to start observation temporarily and disconnect automatically to save CPU performance
export function triggerDateProcessor() {
  console.log("triggerDateProcessor IN")
  const observer = new MutationObserver((mutations, observerInstance) => {
    // Select only new cards that have not been processed yet
    const cards = document.querySelectorAll(
      "ytd-rich-item-renderer:not([data-date-processed])"
    )

    if (cards.length) {
      // Execute the video processing function in parallel
      processVideoCards()
      // 🎯 Disconnect immediately after finding new cards so it doesn't run forever
      observerInstance.disconnect() // We must disconnect observer to protect CPU memory.
      console.log(
        "[YouTube Extension] Observer disconnected to protect CPU memory."
      )
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// 🚀 Execute the observer automatically for the initial batch of videos when the page loads
triggerDateProcessor()
