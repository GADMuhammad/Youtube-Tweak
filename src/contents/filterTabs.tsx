import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useState } from "react"

import { getFilterPlace } from "~helpers/getSelectors"
import { filterTabsText } from "~helpers/translationObject"
import useYoutubeThemeAndDom from "~hooks/useYoutubeThemeAndDom"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

// The container above videos:
export const getInlineAnchor = getFilterPlace

// Append the button at the top of the targeted container:
export const getMountPoint = (anchor: HTMLElement) => {
  return anchor.firstElementChild as HTMLElement
}

const FilterTabs = () => {
  const getCurrentTab = () =>
    window.location.href.includes("/shorts") ? "shorts" : "videos"
  const [activeTab, setActiveTab] = useState<"videos" | "shorts">(getCurrentTab)

  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { videos, shorts } = filterTabsText[currentLang]

  const filterButtons = [
    {
      id: "videos",
      name: videos,
      url: "https://www.youtube.com/feed/subscriptions"
    },
    {
      id: "shorts",
      name: shorts,
      url: "https://www.youtube.com/feed/subscriptions/shorts"
    }
  ]
  const { isDarkMode } = useYoutubeThemeAndDom() // custom hook for filer buttons UI

  useEffect(() => {
    const handleUrlChange = () => setActiveTab(getCurrentTab())
    window.addEventListener("yt-navigate-finish", handleUrlChange)
    return () => {
      window.removeEventListener("yt-navigate-finish", handleUrlChange)
    }
  }, [])

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    url: string
  ) => {
    e.preventDefault()
    window.location.href = url
  }

  return (
    <div
      className={`custom-filter-chips ${isDarkMode ? "theme-dark" : "theme-light"}`}>
      {filterButtons.map(({ name, url, id }, index) => (
        <a
          key={name}
          href={url}
          onClick={(e) => handleNavigation(e, url)}
          className={`yt-chip-btn ${activeTab === id ? "yt-chip-active" : ""}`}>
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </a>
      ))}
    </div>
  )
}

export default FilterTabs
