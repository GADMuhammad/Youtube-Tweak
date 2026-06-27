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
    "div#title-container.style-scope.ytd-shelf-renderer"
  )
}

// 2. 🎯 التريكة السحرية: الإرجاع قبل أول عنصر ابن علشان يتحقن في الأول خالص
export const getMountPoint = (anchor: HTMLElement) => {
  return anchor.firstElementChild as HTMLElement
}

const FilterTabs = () => {
  useEffect(() => {
    // 3. 🎯 إخفاء كلمة Latest فقط بدون حذف الـ h2 نفسه عشان نحافظ على الهيكل
    const latestTextH2 = document.querySelector(
      "h2.style-scope.ytd-shelf-renderer"
    ) as HTMLElement
    if (latestTextH2) latestTextH2.style.display = "none"
  }, [])

  return (
    <div className="custom-filter-chips">
      {/* هنعمل زرار تجريبي واحد بس كبداية نشوف مكانه هيكون عامل ازاي */}
      <button className="yt-chip-btn yt-chip-active">Videos</button>
      <button className="yt-chip-btn">Shorts</button>
    </div>
  )
}

export default FilterTabs
