import { useState } from "react"

import { DateSection } from "~components/popup/DateSection"
import { InfiniteScrollSection } from "~components/popup/InfiniteScrollSection"
import { MainMenu, type PopupSection } from "~components/popup/MainMenu"
import { SupportSection } from "~components/popup/SupportSection"
import { popupText } from "~helpers/translationObject"

import "~styles/_popup.scss"

// Stand-in until the popup can read the actual YouTube tab's language —
// that requires querying the active tab, which is the next step (wiring
// the popup up to interact with the YouTube page).
const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = popupText[isArabic ? "ar" : "en"]

type View = "main" | PopupSection

function Popup() {
  const [view, setView] = useState<View>("main")
  const goBack = () => setView("main")

  return (
    <div className="popup-root" dir={isArabic ? "rtl" : "ltr"}>
      {view === "main" && (
        <MainMenu
          labels={{
            date: text.date,
            scroll: text.scroll,
            support: text.support
          }}
          onSelect={setView}
        />
      )}
      {view === "date" && <DateSection backLabel={text.back} onBack={goBack} />}
      {view === "scroll" && (
        <InfiniteScrollSection backLabel={text.back} onBack={goBack} />
      )}
      {view === "support" && (
        <SupportSection backLabel={text.back} onBack={goBack} />
      )}
    </div>
  )
}

export default Popup
