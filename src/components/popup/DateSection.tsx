import { useEffect, useMemo, useState } from "react"

import { Storage } from "@plasmohq/storage"

import {
  toIntlOptions,
  type DateFormat,
  type DateType,
  type MonthFormat,
  type WeekdayFormat,
  type Year_DayFormat
} from "~helpers/dateFormat"
import { dateSectionText } from "~helpers/translationObject"

import { Panel } from "./Panel"
import type { Tab } from "./TabBar"
import { TabBar } from "./TabBar"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const text = dateSectionText[isArabic ? "ar" : "en"]

const storage = new Storage({ area: "local" })

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

const dayTabs: Tab<Year_DayFormat>[] = [{ id: "2-digit" }, { id: "numeric" }]

const monthTabs: Tab<MonthFormat>[] = [
  { id: "2-digit" },
  { id: "long" },
  { id: "narrow" },
  { id: "numeric" },
  { id: "short" }
]

const yearTabs: Tab<Year_DayFormat>[] = [{ id: "2-digit" }, { id: "numeric" }]

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
  const [day, setDay] = useState<Year_DayFormat>("numeric")
  const [month, setMonth] = useState<MonthFormat>("long")
  const [year, setYear] = useState<Year_DayFormat>("numeric")
  const [isLoaded, setIsLoaded] = useState(false)

  const previewOptions = useMemo(
    () => toIntlOptions({ dateType, weekday, day, month, year }),
    [dateType, weekday, day, month, year]
  )

  useEffect(() => {
    async function loadSettings() {
      const savedSettings = await storage.get<DateFormat>("dateFormat")
      if (savedSettings) {
        if (savedSettings.dateType) setDateType(savedSettings.dateType)
        if (savedSettings.weekday) setWeekday(savedSettings.weekday)
        if (savedSettings.day) setDay(savedSettings.day)
        if (savedSettings.month) setMonth(savedSettings.month)
        if (savedSettings.year) setYear(savedSettings.year)
      }
      setIsLoaded(true)
    }
    loadSettings()
  }, [])

  const saveToStorage = async (updatedFields: Partial<DateFormat>) => {
    const currentSettings: DateFormat = {
      dateType,
      weekday,
      day,
      month,
      year,
      ...updatedFields
    }
    await storage.set("dateFormat", currentSettings)
  }

  const arabicPreview = useMemo(
    () => new Intl.DateTimeFormat("ar-EG", previewOptions).format(PREVIEW_DATE),
    [previewOptions]
  )

  const englishPreview = useMemo(
    () => new Intl.DateTimeFormat("en-UK", previewOptions).format(PREVIEW_DATE),
    [previewOptions]
  )

  const datePreview = [
    { label: text.previewArabic, preview: arabicPreview },
    { label: text.previewEnglish, preview: englishPreview }
  ]

  if (!isLoaded) return <Panel />

  return (
    <Panel>
      <div className="popup-settings">
        <SettingRow<DateType>
          label={text.dateType}
          tabs={dateTypeTabs}
          active={dateType}
          onChange={(val) => {
            setDateType(val)
            saveToStorage({ dateType: val })
          }}
        />
        <SettingRow<WeekdayFormat>
          label={text.weekday}
          tabs={weekdayTabs}
          active={weekday}
          onChange={(val) => {
            setWeekday(val)
            saveToStorage({ weekday: val })
          }}
        />
        <SettingRow<Year_DayFormat>
          label={text.day}
          tabs={dayTabs}
          active={day}
          onChange={(val) => {
            setDay(val)
            saveToStorage({ day: val })
          }}
        />
        <SettingRow<MonthFormat>
          label={text.month}
          tabs={monthTabs}
          active={month}
          onChange={(val) => {
            setMonth(val)
            saveToStorage({ month: val })
          }}
        />
        <SettingRow<Year_DayFormat>
          label={text.year}
          tabs={yearTabs}
          active={year}
          onChange={(val) => {
            setYear(val)
            saveToStorage({ year: val })
          }}
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
