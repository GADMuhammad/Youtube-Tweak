import { BackButton } from "./BackButton"

interface SupportSectionProps {
  backLabel: string
  onBack: () => void
}

export function SupportSection({ backLabel, onBack }: SupportSectionProps) {
  return (
    <div className="popup-section">
      <BackButton label={backLabel} onClick={onBack} />
    </div>
  )
}
