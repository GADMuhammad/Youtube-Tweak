import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  return document.querySelector("ytd-rich-grid-renderer")
}

export const getMountPoint = (anchor: HTMLElement) => {
  return anchor
}

const PlasmoInlineButton = () => {
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

  const stopObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }

  useEffect(() => {
    startObserver()
    return () => stopObserver()
  }, [])

  const handleLoadMore = () => {
    if (isLoading) return
    setIsLoading(true)

    stopObserver()

    const continuationItem = document.querySelector(
      "ytd-rich-grid-renderer ytd-continuation-item-renderer.style-scope.ytd-rich-grid-renderer"
    ) as HTMLElement

    if (continuationItem) {
      continuationItem.style.display = "block"
      console.log("DONE")
    }

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

    observe(document.body, { childList: true, subtree: true })
  }

  return (
    <div className="custom-btn-container">
      <button
        className={`custom-trigger-btn ${isLoading ? "loading" : ""}`}
        onClick={handleLoadMore}
        disabled={isLoading}>
        {isLoading ? "Loading..." : "Load More Videos 🚀"}
      </button>
    </div>
  )
}

export default PlasmoInlineButton
