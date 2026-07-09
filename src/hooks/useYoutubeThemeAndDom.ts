import { useEffect, useState } from "react"

export default function useYoutubeThemeAndDom() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  )

  useEffect(() => {
    // Hide 'latest' H2 to replace it with filter buttons:
    const latestTextH2 = document.querySelector<HTMLElement>(
      "h2.style-scope.ytd-shelf-renderer"
    )
    if (latestTextH2) latestTextH2.style.display = "none"

    // targeting the outside host element
    const allPlasmoCsuis = document.querySelectorAll("plasmo-csui")

    allPlasmoCsuis.forEach((plasmoCsui) => {
      if (plasmoCsui && plasmoCsui.shadowRoot) {
        const shadowContainer = plasmoCsui.shadowRoot.querySelector(
          "div#plasmo-shadow-container"
        ) as HTMLElement

        if (shadowContainer) {
          // to protect youtube layout
          shadowContainer.style.setProperty("z-index", "10", "important")
        }
      }
    })

    // handle if youtube theme is different than system theme
    const hasDarkAttribute = document.documentElement.hasAttribute("dark")
    if (hasDarkAttribute !== isDarkMode) setIsDarkMode(hasDarkAttribute)
  }, [])

  return { isDarkMode }
}
