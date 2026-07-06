import { BackButton } from "./BackButton"

interface InfiniteScrollSectionProps {
  backLabel: string
  onBack: () => void
}

export function InfiniteScrollSection({
  backLabel,
  onBack
}: InfiniteScrollSectionProps) {
  return (
    <div className="popup-section">
      <BackButton label={backLabel} onClick={onBack} />
    </div>
  )
}
