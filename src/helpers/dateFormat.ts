import { Storage } from "@plasmohq/storage"

export type DateType = "gregorian" | "hijri"
export type WeekdayFormat = "long" | "narrow" | "short" | "none"
export type DayFormat = "2-digit" | "numeric"
export type MonthFormat = "2-digit" | "long" | "narrow" | "numeric" | "short"
export type YearFormat = "2-digit" | "numeric"

export interface DateFormatConfig {
  dateType: DateType
  weekday: WeekdayFormat
  day: DayFormat
  month: MonthFormat
  year: YearFormat
}

// Mirrors the formatter that used to be hardcoded in dateReplacer.ts.
export const DEFAULT_DATE_FORMAT_CONFIG: DateFormatConfig = {
  dateType: "gregorian",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
}

// Shared storage key so the popup (DateSection) and the content script
// (dateReplacer) agree on where the chosen format lives.
export const DATE_FORMAT_STORAGE_KEY = "dateFormatConfig"

// The popup and the content script run in separate JS contexts, so
// chrome.storage is the only channel between them — same "local" area
// dateReplacer.ts already uses to cache each video's ISO date.
export const dateFormatStorage = new Storage({ area: "local" })

export function toIntlOptions(
  config: DateFormatConfig
): Intl.DateTimeFormatOptions {
  return {
    calendar: config.dateType === "hijri" ? "islamic" : "gregory",
    // Intl has no "none" weekday token — showing no weekday just means
    // omitting the option entirely.
    weekday: config.weekday === "none" ? undefined : config.weekday,
    day: config.day,
    month: config.month,
    year: config.year
  }
}
