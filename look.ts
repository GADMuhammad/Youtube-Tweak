async function processVideoCards() {
  const cards = document.querySelectorAll(
    "ytd-rich-item-renderer:not([data-date-processed])"
  )
  if (!cards.length) return

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

    console.log("1")
    if (anchor && dateSpan) {
      console.log("2")
      const href = anchor.getAttribute("href") || ""
      const urlParams = new URLSearchParams(href.split("?")[1])
      const videoId = urlParams.get("v")

      if (videoId) {
        const cachedISO = await storage.get<RegExpMatchArray>(videoId)
        let exactDateISO = cachedISO

        if (!cachedISO) {
          exactDateISO = await fetchVideoExactISO(videoId)
          if (exactDateISO) storage.set(videoId, exactDateISO)
        }

        if (exactDateISO) {
          const videoDate = new Date(
            exactDateISO[0].match(/content="([^"]+)"/)[1]
          )
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
    }
  })
  await Promise.all(promises)
}
