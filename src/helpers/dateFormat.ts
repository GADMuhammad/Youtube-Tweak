export type DateType = "gregorian" | "hijri"
export type WeekdayFormat = "long" | "narrow" | "short" | "none"
export type Year_DayFormat = "2-digit" | "numeric"
export type MonthFormat = "2-digit" | "long" | "narrow" | "numeric" | "short"

export interface DateFormat {
  dateType: DateType
  weekday: WeekdayFormat
  day: Year_DayFormat
  month: MonthFormat
  year: Year_DayFormat
}

// Single source of truth for turning a DateFormat into Intl options — used
// by both DateSection.tsx (preview) and dateReplacer.ts (actual render) so
// the two can't drift apart.
export function toIntlOptions(config: DateFormat): Intl.DateTimeFormatOptions {
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
