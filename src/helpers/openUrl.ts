const EMPTY_TAB_URLS = new Set([
  "chrome://newtab/",
  "chrome://new-tab-page/",
  "about:blank",
  "edge://newtab/"
])

function isEmptyTab(tab: chrome.tabs.Tab | undefined): boolean {
  if (!tab?.url) return true
  return EMPTY_TAB_URLS.has(tab.url)
}

// Reuses the active tab if it's an empty new-tab page, otherwise opens a new
// tab alongside it so an in-progress browsing session is never displaced.
export async function openUrl(url: string): Promise<void> {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  })

  if (activeTab?.id && isEmptyTab(activeTab)) {
    await chrome.tabs.update(activeTab.id, { url })
  } else {
    await chrome.tabs.create({ url })
  }

  // No-op outside the popup (e.g. the background service worker).
  if (typeof window !== "undefined") window.close()
}
