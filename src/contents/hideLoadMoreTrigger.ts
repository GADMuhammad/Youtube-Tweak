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

export const config: PlasmoCSConfig = {
  matches: ["https://*.youtube.com/*"],
  run_at: "document_start"
}
