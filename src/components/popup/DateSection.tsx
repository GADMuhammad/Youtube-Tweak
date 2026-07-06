import { BackButton } from "./BackButton"

interface DateSectionProps {
  backLabel: string
  onBack: () => void
}

export function DateSection({ backLabel, onBack }: DateSectionProps) {
  return (
    <div className="popup-section">
      <BackButton label={backLabel} onClick={onBack} />
    </div>
  )
}
