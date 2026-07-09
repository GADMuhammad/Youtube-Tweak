interface LoadMoreButtonProps {
  isLoading: boolean
  loadingText: string
  buttonText: string
  onClick: () => void
}

export function LoadMoreButton({
  isLoading,
  loadingText,
  buttonText,
  onClick
}: LoadMoreButtonProps) {
  return (
    <div className="custom-btn-container">
      <button
        className={`custom-trigger-btn ${isLoading ? "loading" : ""}`}
        onClick={onClick}
        disabled={isLoading}>
        {isLoading ? loadingText : buttonText}
      </button>
    </div>
  )
}
