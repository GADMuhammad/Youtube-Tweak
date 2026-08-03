import type { PlasmoCSConfig } from "plasmo"

// Runs at document_start — before YouTube's own scripts execute — so this
// rule exists in the document before any continuation item (comments,
// video/Shorts grids, playlists, search results, etc.) is ever inserted.
// That closes the race with YouTube's IntersectionObserver (see
// useLoadMoreBlocker.ts): a MutationObserver reacting to the node being
// added can lose that race depending on page load timing, since it fires
// after the node already exists and may already have a laid-out, visible
// rect. A CSS rule present beforehand means the element never gets a
// non-empty layout box in the first place, so YouTube's IntersectionObserver
// never sees it as intersecting and never fires the fetch for it — no matter
// how fast or slow our own script attaches afterwards.
//
// Originally scoped to comments only, but the same race hits every other
// Load More surface — most noticeably the Shorts subscriptions feed
// (/feed/subscriptions/shorts), whose grid can be fully in view on load, so
// it's applied to all continuation items here. Excludes ones nested inside
// ytd-comment-replies-renderer, which is the unrelated "show more replies"
// continuation, not one of the "load more" triggers we block.
const style = document.createElement("style")
style.textContent = `
  ytd-continuation-item-renderer:not(ytd-comment-replies-renderer *) {
    display: none !important;
  }
`

document.documentElement.appendChild(style)

// The Subscriptions feed's "Latest" shelf heading (replaced by our own
// filter buttons) and its inline Shorts row (see useYoutubeThemeAndDom.ts)
// were previously hidden from a React effect, which only runs after first
// paint — causing a visible flash of both before they got hidden. Hiding
// them here instead means the rule exists before YouTube ever lays them
// out. Scoped to the Subscriptions feed only (checked on every SPA
// navigation, since document_start only runs once per real page load):
// these selectors also match unrelated shelf headings elsewhere on YouTube
// (home page, search, channel pages).
const feedOnlyStyle = document.createElement("style")
document.documentElement.appendChild(feedOnlyStyle)

const updateFeedOnlyStyle = () => {
  const isSubscriptionsFeed = location.pathname.startsWith(
    "/feed/subscriptions"
  )
  feedOnlyStyle.textContent = isSubscriptionsFeed
    ? `
      h2.style-scope.ytd-shelf-renderer {
        display: none !important;
      }
      ytd-rich-section-renderer[is-shorts].style-scope.ytd-rich-grid-renderer,
      ytd-rich-section-renderer:has(#rich-shelf-header-container) {
        display: none !important;
      }
    `
    : ""
}

updateFeedOnlyStyle()
window.addEventListener("yt-navigate-finish", updateFeedOnlyStyle)

export const config: PlasmoCSConfig = {
  matches: ["https://*.youtube.com/*"],
  run_at: "document_start"
}
