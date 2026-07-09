import { useState } from "react"

import { getCommentsContinuationItem } from "~helpers/getSelectors"
import { loadingCommentsButton } from "~helpers/translationObject"

import { useLoadMoreBlocker } from "./useLoadMoreBlocker"

const countThreads = () =>
  document.querySelectorAll("ytd-comments#comments ytd-comment-thread-renderer")
    .length

export const useCommentsInfiniteScrollBlocker = () => {
  // tracks whether any comment has ever been loaded, purely to pick the
  // button label ("Load Comments" vs "Load More Comments") — unlike videos,
  // our block also gates the very first batch, so 0 threads is the normal
  // starting state, not an empty-page signal.
  const [hasComments, setHasComments] = useState(() => countThreads() > 0)

  const currentLang = document.documentElement.lang?.startsWith("ar")
    ? "ar"
    : "en"
  const { loadingText, loadText, loadMoreText } =
    loadingCommentsButton[currentLang]
  const buttonText = hasComments ? loadMoreText : loadText

  const { isLoading, situation, handleLoadMore } = useLoadMoreBlocker({
    getContinuationItem: getCommentsContinuationItem,
    countItems: countThreads,
    blockWhenEmpty: true,
    hasNewContent: (countBefore) => countThreads() > countBefore,
    onNewContent: () => setHasComments(true)
  })

  return { isLoading, situation, loadingText, buttonText, handleLoadMore }
}
