// Requires "activeTab" + "scripting" permissions. activeTab grants access to
// whatever tab is focused at the moment the popup is opened by the user, so
// this works without declaring broad host_permissions.
export async function getActiveTabSelection(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return ""

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection()?.toString() ?? ""
  })

  return (injection?.result ?? "").replace(/\s+/g, " ").trim()
}
