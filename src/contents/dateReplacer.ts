import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions"]
}

function processVideoCards() {
  const cards = document.querySelectorAll("ytd-rich-item-renderer")
  console.log(`[YouTube Extension]${cards.length} ...`)

  cards.forEach((card, index) => {
    const htmlCard = card as HTMLElement

    const anchor = htmlCard.querySelector(
      "a.ytLockupMetadataViewModelTitle"
    ) as HTMLAnchorElement | null

    const spans = htmlCard.querySelectorAll(
      "div.ytContentMetadataViewModelMetadataRow span[role='text'].ytAttributedStringHost.ytContentMetadataViewModelMetadataText.ytAttributedStringWhiteSpacePreWrap.ytAttributedStringLinkInheritColor"
    )
    const dateSpan = spans[1] as HTMLElement | null

    if (anchor && dateSpan) {
      const href = anchor.getAttribute("href") || ""
      const urlParams = new URLSearchParams(href.split("?")[1])

      const videoId = urlParams.get("v")

      if (videoId) {
        console.log(index)
        console.log(videoId)
        dateSpan.innerText
      }
    }
  })
}

setTimeout(processVideoCards, 5000)
