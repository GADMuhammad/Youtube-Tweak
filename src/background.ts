import { youtubeSearchUrl } from "~helpers/youtubeSuggest"

const SEARCH_MENU_ID = "youtube-tweak-search-selection"

const isArabic = chrome.i18n.getUILanguage().startsWith("ar")
const menuTitle = isArabic
  ? 'البحث عن "%s" في يوتيوب'
  : 'Search "%s" on YouTube'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: SEARCH_MENU_ID,
    title: menuTitle,
    contexts: ["selection"]
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== SEARCH_MENU_ID || !info.selectionText) return
  chrome.tabs.create({ url: youtubeSearchUrl(info.selectionText) })
})
