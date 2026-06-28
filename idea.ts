async function fetchVideoExactISO(videoId: string): Promise<RegExpMatchArray> {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    const text: string = await response.text()
    const match: RegExpMatchArray = text.match(
      /<meta itemprop="datePublished" content="([^"]+)">/
    )

    if (match) {
      const videoDate = new Date(match[0].match(/content="([^"]+)"/)[1])
      console.log(videoDate)

      console.log(
        videoDate.toLocaleDateString("en-UK", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      )

      console.log(
        videoDate.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      )

      return match
    }
    return null
  } catch (e) {
    console.error("Error in fetching the video.", videoId, e)
    return null
  }
}

fetchVideoExactISO("-es3y0qV7o4")
