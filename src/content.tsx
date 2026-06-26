import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

const PlasmoOverlay = () => {
  const [isLoading, setIsLoading] = useState(false)
  const observerRef = useRef<MutationObserver | null>(null)

  const disableInfiniteScroll = () => {
    const continuationItem = document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
    )
    if (
      continuationItem &&
      (continuationItem as HTMLElement).style.display !== "none"
    ) {
      ;(continuationItem as HTMLElement).style.display = "none"
    }
  }

  // Turn on (MutationObserver)
  const startObserver = () => {
    if (observerRef.current) return // If the observer's already on, so you don't have to do anything.

    disableInfiniteScroll() // Initial hide

    observerRef.current = new MutationObserver(() => {
      disableInfiniteScroll()
    })

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  // 1. Pause the observer to stop overriding styles
  const stopObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }

  useEffect(() => {
    // Initialize the observer when the page loads
    startObserver()
    return () => stopObserver()
  }, [])

  // Simulates an infinite scroll trigger when the user clicks the button
  const handleLoadMore = () => {
    if (isLoading) return
    setIsLoading(true)

    // 1. Pause the observer to stop overriding styles
    stopObserver()

    // 2. Reveal the loader so YouTube's IntersectionObserver can detect it
    const continuationItem = document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
    ) as HTMLElement

    if (continuationItem) {
      continuationItem.style.display = "block" // bring the loader back again with (display: block)
      console.log("DONE")
    }

    // the count of the current videos .. to compare it with the count of the total new number with the add videos (if it's existed)
    const currentVideoCount = document.querySelectorAll(
      "ytd-rich-item-renderer"
    ).length

    // checkLoaderObserver:
    const { observe } = new MutationObserver((mutations, observerInstance) => {
      // the count of the new videos
      const newVideoCount = document.querySelectorAll(
        "ytd-rich-item-renderer"
      ).length

      if (newVideoCount > currentVideoCount) {
        observerInstance.disconnect()
        startObserver()
        setIsLoading(false)
      }
    })

    // turn on the temporary observer to observe the added videos
    observe(document.body, { childList: true, subtree: true })
  }

  return (
    <button
      className={`custom-trigger-btn ${isLoading ? "loading" : ""}`}
      onClick={handleLoadMore}
      disabled={isLoading}>
      {isLoading ? "Loading..." : "Load More Videos 🚀"}
    </button>
  )
}

export default PlasmoOverlay
