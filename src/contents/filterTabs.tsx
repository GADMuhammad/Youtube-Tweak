import cssText from "data-text:~/style.scss"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect } from "react"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/feed/subscriptions*"]
}

export const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement("style")
  styleElement.textContent = cssText
  return styleElement
}

// 1. 🎯 استهداف حاوية العنوان فوق على الشمال بالملي
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  return document.querySelector(
    "div.grid-subheader.style-scope.ytd-shelf-renderer div#title-container.style-scope.ytd-shelf-renderer"
  )
}

// 2. 🎯 التريكة السحرية: الإرجاع قبل أول عنصر ابن علشان يتحقن في الأول خالص
export const getMountPoint = (anchor: HTMLElement) => {
  return anchor.firstElementChild as HTMLElement
}

const FilterTabs = () => {
  useEffect(() => {
    const latestTextH2 = document.querySelector(
      "h2.style-scope.ytd-shelf-renderer"
    ) as HTMLElement
    if (latestTextH2) latestTextH2.style.display = "none"

    // 1. استهداف العنصر الخارجي (الـ Host)
    const plasmoCsui = document.querySelector("plasmo-csui")

    if (plasmoCsui && plasmoCsui.shadowRoot) {
      // 2. 🔥 التريكة السحرية: دخول جوه الـ Shadow Root وقنص الـ div المجرم بالملي
      const shadowContainer = plasmoCsui.shadowRoot.querySelector(
        "div#plasmo-shadow-container"
      ) as HTMLElement

      if (shadowContainer) {
        // 3. تصفير الـ z-index وتعديل الـ position غصب عن Plasmo
        shadowContainer.style.setProperty("z-index", "10", "important")
      }
    }
  }, [])

  return (
    <div className="custom-filter-chips">
      <button className="yt-chip-btn yt-chip-active">Videos</button>
      <button className="yt-chip-btn">Shorts</button>
    </div>
  )
}

export default FilterTabs
