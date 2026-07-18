import { useState } from "react"

import { DateSection } from "~components/popup/DateSection"
import { InfiniteScrollSection } from "~components/popup/InfiniteScrollSection"
import { SupportSection } from "~components/popup/SupportSection"
import { TabBar } from "~components/popup/TabBar"
import { popupText } from "~helpers/translationObject"

import "~/style.scss"

// Stand-in until the popup can read the actual YouTube tab's language —
// that requires querying the active tab, which is the next step (wiring
// the popup up to interact with the YouTube page).
const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = popupText[isArabic ? "ar" : "en"]

type Sections = "date" | "scroll" | "support"

function Popup() {
  const [active, setActive] = useState<Sections>("date")

  return (
    <div className="popup-root" dir={isArabic ? "rtl" : "ltr"}>
      <TabBar<Sections>
        active={active}
        onChange={setActive}
        tabs={[
          { id: "date", label: text.date },
          {
            id: "scroll",
            label: text.scroll,
            disabled: true,
            tooltip: text.comingSoon
          },
          { id: "support", label: text.support }
        ]}
      />
      {active === "date" && <DateSection />}
      {active === "scroll" && <InfiniteScrollSection />}
      {active === "support" && <SupportSection />}
    </div>
  )
}

export default Popup
