import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions"]
}

function processVideoCards() {
  const cards = document.querySelectorAll("ytd-rich-item-renderer")
  console.log(`[YouTube Extension] جاري فحص تفاصيل الـ ${cards.length} كارت...`)

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
      const query = href.split("?")[1]
      const urlParams = new URLSearchParams(query)

      const videoId = urlParams.get("v")

      if (videoId) {
        console.log(`🎥 فيديو رقم ${index + 1}:`)
        console.log(`- الـ ID المستخرج: ${videoId}`)
        console.log(`- النص الحالي للتاريخ: "${dateSpan.innerText}"`)
      }
    }
  })
}

// الانتظار 3 ثوانٍ حتى نضمن تحميل يوتيوب للبيانات
setTimeout(processVideoCards, 5000)
