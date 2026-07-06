import { ArrowBackIcon } from "./icons"

interface BackButtonProps {
  label: string
  onClick: () => void
}

export function BackButton({ label, onClick }: BackButtonProps) {
  return (
    <button type="button" className="popup-back-btn" onClick={onClick}>
      <ArrowBackIcon className="popup-back-btn__icon" />
      {label}
    </button>
  )
}
