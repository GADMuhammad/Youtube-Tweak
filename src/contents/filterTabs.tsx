import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

// The container above videos:
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  return document.querySelector(
    "div.grid-subheader.style-scope.ytd-shelf-renderer div#title-container.style-scope.ytd-shelf-renderer"
  )
}

export const getMountPoint = (anchor: HTMLElement) => {
  return anchor.firstElementChild as HTMLElement
}

const FilterTabs = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  )

  useEffect(() => {
    // Hide 'latest' H2 to replace it with filter buttons:
    const latestTextH2 = document.querySelector(
      "h2.style-scope.ytd-shelf-renderer"
    ) as HTMLElement
    if (latestTextH2) latestTextH2.style.display = "none"

    // 1. targeting the outside host element
    const plasmoCsui = document.querySelector("plasmo-csui")

    if (plasmoCsui && plasmoCsui.shadowRoot) {
      const shadowContainer = plasmoCsui.shadowRoot.querySelector(
        "div#plasmo-shadow-container"
      ) as HTMLElement

      if (shadowContainer) {
        shadowContainer.style.setProperty("z-index", "10", "important")
      }
    }

    //   handle if youtube theme is different than system theme
    const hasDarkAttribute = document.documentElement.hasAttribute("dark")
    if (hasDarkAttribute !== isDarkMode) setIsDarkMode(hasDarkAttribute)
  }, [])

  return (
    <div
      className={`custom-filter-chips ${isDarkMode ? "theme-dark" : "theme-light"}`}>
      <button className="yt-chip-btn yt-chip-active">Videos</button>
      <button className="yt-chip-btn">Shorts</button>
    </div>
  )
}

export default FilterTabs
