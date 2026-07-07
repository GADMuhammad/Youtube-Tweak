import { useStorage } from "@plasmohq/storage/hook"
import { useMemo } from "react"

import {
  DATE_FORMAT_STORAGE_KEY,
  dateFormatStorage,
  DEFAULT_DATE_FORMAT_CONFIG,
  type DayFormat,
  type DateType,
  type MonthFormat,
  type WeekdayFormat,
  type YearFormat
} from "~helpers/dateFormat"
import { dateSectionText } from "~helpers/translationObject"

import { Panel } from "./Panel"
import type { Tab } from "./TabBar"
import { TabBar } from "./TabBar"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = dateSectionText[isArabic ? "ar" : "en"]

// Fixed rather than `new Date()` so the preview doesn't silently change
// depending on which weekday/day the user happens to open the popup on.
const PREVIEW_DATE = new Date(2026, 0, 5)

const dateTypeTabs: Tab<DateType>[] = [
  { id: "gregorian", label: text.gregorian },
  { id: "hijri", label: text.hijri }
]

const weekdayTabs: Tab<WeekdayFormat>[] = [
  { id: "long" },
  { id: "narrow" },
  { id: "short" },
  { id: "none", label: text.weekdayNone }
]

const dayTabs: Tab<DayFormat>[] = [{ id: "2-digit" }, { id: "numeric" }]

const monthTabs: Tab<MonthFormat>[] = [
  { id: "2-digit" },
  { id: "long" },
  { id: "narrow" },
  { id: "numeric" },
  { id: "short" }
]

const yearTabs: Tab<YearFormat>[] = [{ id: "2-digit" }, { id: "numeric" }]

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
  // Persisted via chrome.storage so dateReplacer.ts (a separate content
  // script context) can read the same choice and react live via storage.watch.
  const [dateType, setDateType] = useStorage<DateType>(
    { key: DATE_FORMAT_STORAGE_KEY + ".dateType", instance: dateFormatStorage },
    DEFAULT_DATE_FORMAT_CONFIG.dateType
  )
  const [weekday, setWeekday] = useStorage<WeekdayFormat>(
    { key: DATE_FORMAT_STORAGE_KEY + ".weekday", instance: dateFormatStorage },
    DEFAULT_DATE_FORMAT_CONFIG.weekday
  )
  const [day, setDay] = useStorage<DayFormat>(
    { key: DATE_FORMAT_STORAGE_KEY + ".day", instance: dateFormatStorage },
    DEFAULT_DATE_FORMAT_CONFIG.day
  )
  const [month, setMonth] = useStorage<MonthFormat>(
    { key: DATE_FORMAT_STORAGE_KEY + ".month", instance: dateFormatStorage },
    DEFAULT_DATE_FORMAT_CONFIG.month
  )
  const [year, setYear] = useStorage<YearFormat>(
    { key: DATE_FORMAT_STORAGE_KEY + ".year", instance: dateFormatStorage },
    DEFAULT_DATE_FORMAT_CONFIG.year
  )

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

  const datePreview = [
    { label: text.previewArabic, preview: arabicPreview },
    { label: text.previewEnglish, preview: englishPreview }
  ]

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
        {datePreview.map(({ label, preview }) => (
          <div key={preview} className="popup-preview__row">
            <span className="popup-preview__tag">{label}</span>
            <span className="popup-preview__value" dir="rtl">
              {preview}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}
