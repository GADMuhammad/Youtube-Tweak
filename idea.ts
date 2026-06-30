const isArabic = document.documentElement.lang?.startsWith("ar")
const formatter = new Intl.DateTimeFormat(
  isArabic ? "ar-SA-u-ca-islamic" : "en-UK-u-ca-islamic",
  {
    weekday: "short",
    day: "numeric",
    month: "short"
  }
)

//

if (exactDateISO) {
  const videoDate = new Date(exactDateISO)
  dateSpan.innerText = formatter.format(videoDate)
}
