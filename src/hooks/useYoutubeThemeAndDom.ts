import { useEffect, useState } from "react"

export default function useYoutubeThemeAndDom(activeTab: "videos" | "shorts") {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  )

  useEffect(() => {
    // Hide 'latest' H2 to replace it with filter buttons:
    const titleContainer = document.querySelector(
      "div#title-container.style-scope.ytd-shelf-renderer"
    ) as HTMLElement
    if (titleContainer) titleContainer.remove()

    // targeting the outside host element
    const plasmoCsui = document.querySelector("plasmo-csui")

    if (plasmoCsui && plasmoCsui.shadowRoot) {
      const shadowContainer = plasmoCsui.shadowRoot.querySelector(
        "div#plasmo-shadow-container"
      ) as HTMLElement

      if (shadowContainer) {
        shadowContainer.style.setProperty("z-index", "10", "important")
      }
    }

    // handle if youtube theme is different than system theme
    const hasDarkAttribute = document.documentElement.hasAttribute("dark")
    if (hasDarkAttribute !== isDarkMode) setIsDarkMode(hasDarkAttribute)
  }, [])

  useEffect(() => {
    if (activeTab !== "videos") return

    const hideShorts = () => {
      const shortsSection = document.querySelector(
        "ytd-rich-section-renderer[is-shorts].style-scope.ytd-rich-grid-renderer, ytd-rich-section-renderer:has(#rich-shelf-header-container)"
      ) as HTMLElement

      if (shortsSection) {
        shortsSection.style.setProperty("display", "none", "important")
      }
    }

    activeTab === "videos" ? hideShorts() : ""

    const observer = new MutationObserver(() => {
      activeTab === "videos" ? hideShorts() : ""
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [activeTab])

  return { isDarkMode }
}
