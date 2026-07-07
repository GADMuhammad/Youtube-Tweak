import { useMemo, useState } from "react"

import { dateSectionText } from "~helpers/translationObject"

import { Panel } from "./Panel"
import type { Tab } from "./TabBar"
import { TabBar } from "./TabBar"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = dateSectionText[isArabic ? "ar" : "en"]

type DateType = "gregorian" | "hijri"
type WeekdayFormat = "long" | "narrow" | "short" | "none"
type DayFormat = "2-digit" | "numeric"
type MonthFormat = "2-digit" | "long" | "narrow" | "numeric" | "short"
type YearFormat = "2-digit" | "numeric"

// Fixed rather than `new Date()` so the preview doesn't silently change
// depending on which weekday/day the user happens to open the popup on.
const PREVIEW_DATE = new Date(2026, 0, 5)

const dateTypeTabs: Tab<DateType>[] = [
  { id: "gregorian", label: text.gregorian },
  { id: "hijri", label: text.hijri }
]

const weekdayTabs: Tab<WeekdayFormat>[] = [
  { id: "long", label: "long" },
  { id: "narrow", label: "narrow" },
  { id: "short", label: "short" },
  { id: "none", label: text.weekdayNone }
]

const dayTabs: Tab<DayFormat>[] = [
  { id: "2-digit", label: "2-digit" },
  { id: "numeric", label: "numeric" }
]

const monthTabs: Tab<MonthFormat>[] = [
  { id: "2-digit", label: "2-digit" },
  { id: "long", label: "long" },
  { id: "narrow", label: "narrow" },
  { id: "numeric", label: "numeric" },
  { id: "short", label: "short" }
]

const yearTabs: Tab<YearFormat>[] = [
  { id: "2-digit", label: "2-digit" },
  { id: "numeric", label: "numeric" }
]

interface SettingRowProps<T extends string> {
  label: string
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
}

function SettingRow<T extends string>({
  label,
  tabs,
  active,
  onChange
}: SettingRowProps<T>) {
  return (
    <div className="popup-setting-row">
      <span className="popup-setting-row__label">{label}</span>
      <TabBar<T>
        tabs={tabs}
        active={active}
        onChange={onChange}
        className="popup-tabbar--wrap"
      />
    </div>
  )
}

export function DateSection() {
  // Defaults mirror the formatter currently hardcoded in dateReplacer.ts.
  const [dateType, setDateType] = useState<DateType>("gregorian")
  const [weekday, setWeekday] = useState<WeekdayFormat>("long")
  const [day, setDay] = useState<DayFormat>("numeric")
  const [month, setMonth] = useState<MonthFormat>("long")
  const [year, setYear] = useState<YearFormat>("numeric")

  const calendar = dateType === "hijri" ? "islamic" : "gregory"

  // Intl has no "none" weekday token — showing no weekday just means
  // omitting the option entirely.
  const weekdayOption = weekday === "none" ? undefined : weekday

  const arabicPreview = useMemo(
    () =>
      new Intl.DateTimeFormat("ar-EG", {
        calendar,
        weekday: weekdayOption,
        day,
        month,
        year
      }).format(PREVIEW_DATE),
    [calendar, weekdayOption, day, month, year]
  )

  const englishPreview = useMemo(
    () =>
      new Intl.DateTimeFormat("en-UK", {
        calendar,
        weekday: weekdayOption,
        day,
        month,
        year
      }).format(PREVIEW_DATE),
    [calendar, weekdayOption, day, month, year]
  )

  return (
    <Panel>
      <div className="popup-settings">
        <SettingRow<DateType>
          label={text.dateType}
          tabs={dateTypeTabs}
          active={dateType}
          onChange={setDateType}
        />
        <SettingRow<WeekdayFormat>
          label={text.weekday}
          tabs={weekdayTabs}
          active={weekday}
          onChange={setWeekday}
        />
        <SettingRow<DayFormat>
          label={text.day}
          tabs={dayTabs}
          active={day}
          onChange={setDay}
        />
        <SettingRow<MonthFormat>
          label={text.month}
          tabs={monthTabs}
          active={month}
          onChange={setMonth}
        />
        <SettingRow<YearFormat>
          label={text.year}
          tabs={yearTabs}
          active={year}
          onChange={setYear}
        />
      </div>

      <div className="popup-preview">
        <span className="popup-preview__label">{text.preview}</span>
        <div className="popup-preview__row">
          <span className="popup-preview__tag">{text.previewArabic}</span>
          <span className="popup-preview__value" dir="rtl">
            {arabicPreview}
          </span>
        </div>
        <div className="popup-preview__row">
          <span className="popup-preview__tag">{text.previewEnglish}</span>
          <span className="popup-preview__value" dir="ltr">
            {englishPreview}
          </span>
        </div>
      </div>
    </Panel>
  )
}
