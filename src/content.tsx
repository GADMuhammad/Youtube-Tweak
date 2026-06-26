import "~style.scss"

import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

const PlasmoOverlay = () => {
  useEffect(() => {
    const disableInfiniteScroll = () => {
      const continuationItem = document.querySelector(
        "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
      )
      if (continuationItem) {
        ;(continuationItem as HTMLElement).style.display = "none"
      }
    }
    disableInfiniteScroll()
    const observer = new MutationObserver(() => {
      disableInfiniteScroll()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // return (
  //   <div className="z-50 flex fixed bottom-10 right-10 bg-red-500 text-white p-5 rounded-xl shadow-2xl">
  //     <p className="text-9xl font-bold bg-red-600">
  //       Subscription Organizer Active! 🚀
  //     </p>
  //   </div>
  // )
}

export default PlasmoOverlay
